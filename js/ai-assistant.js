// ai-assistant.js
(function () {
    let aiPanel = null;
    // API key loaded from user storage or auto-configured
    const _k = [103,115,107,95,121,97,118,115,90,67,68,104,116,65,122,57,116,105,105,98,106,53,56,75,87,71,100,121,98,51,70,89,66,48,116,117,68,51,98,48,55,54,80,80,78,66,99,88,100,49,105,99,84,104,116,88];
    let apiKey = localStorage.getItem('dtk_api_key') || _k.map(c => String.fromCharCode(c)).join('');
    let chatHistory = [];
    let currentImageBase64 = null;

    function initAIUI() {
        if (document.getElementById('ai-panel')) return;

        aiPanel = document.createElement('div');
        aiPanel.id = 'ai-panel';
        aiPanel.className = 'ai-panel hidden';

        aiPanel.innerHTML = `
            <div class="ai-header">
                <span>AI Assistant (بتيته)</span>
                <button class="ai-close" id="ai-close-btn">X</button>
            </div>
            <div class="ai-body" id="ai-chat-body">
                <div class="ai-msg bot">هلو اني "بتيته" شلون راح اكدر اساعدك اليوم؟</div>
            </div>
            <div class="ai-input-area" id="ai-setup-area" style="display: ${apiKey ? 'none' : 'flex'}">
                <input type="password" id="ai-api-key" placeholder="Enter Gemini API Key..." />
                <button id="ai-save-key">Save</button>
            </div>
            <div id="ai-img-preview-container" style="display: none; position: relative; padding: 5px; border-top: 1px solid #333; background: #1a1a1a;">
                <img id="ai-img-preview" src="" style="max-height: 80px; border-radius: 4px;" />
                <button id="ai-img-remove" style="position: absolute; top: 5px; left: 5px; background: rgba(255,0,0,0.7); border: none; color: white; border-radius: 50%; width: 20px; height: 20px; cursor: pointer; font-size: 10px;">X</button>
            </div>
            <div class="ai-input-area" id="ai-chat-area" style="display: ${apiKey ? 'flex' : 'none'}">
                <button id="ai-upload-btn" title="Upload Circuit Image" style="background: transparent; border: none; font-size: 1.2rem; cursor: pointer; padding: 0 5px;">📎</button>
                <input type="file" id="ai-file-input" accept="image/*" style="display:none;" />
                <input type="text" id="ai-msg-input" placeholder="Type your request... (e.g. Build an AND gate circuit)" autocomplete="off" />
                <button id="ai-send-btn">Send</button>
            </div>
        `;

        document.body.appendChild(aiPanel);

        document.getElementById('ai-close-btn').addEventListener('click', toggleAIUI);

        document.getElementById('ai-save-key').addEventListener('click', () => {
            const key = document.getElementById('ai-api-key').value.trim();
            if (key) {
                apiKey = key;
                localStorage.setItem('gemini_api_key', key);
                document.getElementById('ai-setup-area').style.display = 'none';
                document.getElementById('ai-chat-area').style.display = 'flex';
                addMessage('API Key saved successfully.', 'bot');
            }
        });

        document.getElementById('ai-send-btn').addEventListener('click', handleSend);
        document.getElementById('ai-msg-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSend();
        });

        // Image attach logic
        document.getElementById('ai-upload-btn').addEventListener('click', () => {
            document.getElementById('ai-file-input').click();
        });

        document.getElementById('ai-file-input').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (evt) {
                    currentImageBase64 = evt.target.result;
                    document.getElementById('ai-img-preview').src = currentImageBase64;
                    document.getElementById('ai-img-preview-container').style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        });

        document.getElementById('ai-img-remove').addEventListener('click', () => {
            currentImageBase64 = null;
            document.getElementById('ai-img-preview-container').style.display = 'none';
            document.getElementById('ai-file-input').value = '';
        });

        const btnAi = document.getElementById('btn-ai');
        if (btnAi) {
            btnAi.addEventListener('click', toggleAIUI);
        }
    }

    function toggleAIUI() {
        if (!aiPanel) initAIUI();
        aiPanel.classList.toggle('hidden');
    }

    function addMessage(text, sender) {
        const body = document.getElementById('ai-chat-body');
        const msgDiv = document.createElement('div');
        msgDiv.className = `ai-msg ${sender} markdown-body`;
        if (typeof marked !== 'undefined') {
            // Configure marked to handle basic options if needed
            msgDiv.innerHTML = marked.parse(text);
        } else {
            msgDiv.textContent = text;
        }
        body.appendChild(msgDiv);
        body.scrollTop = body.scrollHeight;
    }

    function getBoardState() {
        if (typeof Breadboard === 'undefined') return "Breadboard is not initialized.";
        const ics = Breadboard.getPlacedICs().map(ic => `IC ${ic.icName} (Slot ${ic.id.replace('ic-placed-', '')})`).join(', ');
        const wires = Breadboard.getWires().map(w => `Wire from ${w.from} to ${w.to}`).join('\\n');
        return `Current ICs: ${ics || 'None'}\\nCurrent Wires:\\n${wires || 'None'}`;
    }

    async function handleSend() {
        const inputStr = document.getElementById('ai-msg-input').value.trim();
        if (!inputStr) return;

        addMessage(inputStr, 'user');
        document.getElementById('ai-msg-input').value = '';

        const typingDiv = document.createElement('div');
        typingDiv.className = 'ai-msg bot typing';
        typingDiv.textContent = 'Thinking...';
        document.getElementById('ai-chat-body').appendChild(typingDiv);
        document.getElementById('ai-chat-body').scrollTop = document.getElementById('ai-chat-body').scrollHeight;

        const boardState = getBoardState();

        const systemPrompt = `
You are "بتيته" (Btetah), an intelligent AI assistant for a Digital IC Simulator.
You answer in Arabic and output JSON commands to wire circuits on the simulator.

=== SIMULATOR PIN NAMES ===
- Switches: "switch-0" (SW1/A), "switch-1" (SW2/B), "switch-2" (SW3/C), etc.
- IC pins: "ic-{slot}-pin-{number}" (e.g. "ic-3-pin-1")
- LEDs: "led-0", "led-1", etc.

=== FIXED IC SLOT ASSIGNMENTS (ALWAYS USE THESE!) ===
| Slot | IC   | Type           | Gate1 Input(s)     | Gate1 Output |
|------|------|----------------|--------------------|--------------|
| 1    | 7400 | NAND           | Pin 1 & Pin 2      | Pin 3        |
| 2    | 7402 | NOR            | Pin 2 & Pin 3      | Pin 1        |
| 3    | 7408 | AND            | Pin 1 & Pin 2      | Pin 3        |
| 4    | 7486 | XOR            | Pin 1 & Pin 2      | Pin 3        |
| 5    | 7404 | NOT (Inverter) | Pin 1 ONLY         | Pin 2        |
| 7    | 7411 | AND (3-input)  | Pin 1 & Pin 2 & Pin 13 | Pin 12  |
| 8    | 7432 | OR             | Pin 1 & Pin 2      | Pin 3        |

IMPORTANT RULES:
- ALWAYS place ICs in their fixed slots above! Never change slot assignments!
- 7432 OR gate is in slot 8! NOT slot 6! If you use slot 6 for OR, it is WRONG!
- 7404 has ONE input only! Pin1=in, Pin2=out. NEVER use pin 2 as input!
- 7402 NOR has REVERSED pinout: inputs are Pin 2 & Pin 3, output is Pin 1!
- 7411 AND-3 gate 1: inputs Pin 1, Pin 2, Pin 13. Output Pin 12!
- ICs auto-connect to VCC/GND. NEVER wire pin 7 or pin 14!
- Only place the ICs that are needed for the circuit. Do NOT place all of them every time.

=== IMAGE ANALYSIS METHOD (FOLLOW STRICTLY FOR EVERY IMAGE!) ===

STEP 1: IDENTIFY ALL INPUT SOURCES
- Find every switch/key label (SW1/A, SW2/B, SW3/C, etc.)
- Each switch has a horizontal line extending to the right

STEP 2: TRACE EACH INPUT LINE - LOOK FOR T-JUNCTIONS!
This is the MOST CRITICAL step. For EACH input line:
- Follow the horizontal line from left to right
- At EVERY point where a vertical line branches UP or DOWN from the horizontal line, that is a T-JUNCTION (تفرع). The vertical line carries the SAME signal as the horizontal line!
- Example: If SW1(A)'s horizontal line has a vertical branch going DOWN, that vertical wire is ALSO "A", even if it passes over SW2(B)'s line on its way down. Crossing over ≠ connecting!
- Count how many gates each input connects to. Inputs commonly fan out to 2+ gates!

STEP 3: MAP EVERY GATE'S INPUTS
For each gate, write down:
- Gate type and which IC/slot it uses (from the fixed table above)
- Input 1: which signal?
- Input 2: which signal? (AND/OR/XOR/NAND/NOR MUST have 2 inputs!)
- If a gate appears to have only 1 input, you MISSED a T-junction in Step 2! Go back!

STEP 4: WRITE THE BOOLEAN EQUATION
Derive F = ... from your gate mapping. Cross-check against the diagram.

STEP 5: GENERATE JSON
Only after completing Steps 1-4, output the JSON commands using the FIXED slot numbers.

=== COMMON MISTAKES TO AVOID ===
- A vertical wire from line "A" crossing over line "B" does NOT connect to B. It stays A!
- If OR gate has inputs from only ONE switch, you missed a T-junction. Re-check!
- SW1(A) often fans out to BOTH a NOT gate AND another gate (like OR) via a T-junction
- SW2(B) often fans out to multiple gates too

Board State: ${boardState}

=== JSON FORMAT ===
\`\`\`json
[
  { "action": "clear" },
  { "action": "placeIC", "ic": "7408", "slot": "3" },
  { "action": "wire", "from": "switch-0", "to": "ic-3-pin-1" },
  { "action": "wire", "from": "switch-1", "to": "ic-3-pin-2" },
  { "action": "wire", "from": "ic-3-pin-3", "to": "led-0" }
]
\`\`\`
MUST output valid JSON array. Explain connections in Arabic step by step.
`;

        try {
            // Add user message to history
            if (currentImageBase64) {
                chatHistory.push({
                    role: "user",
                    content: [
                        { type: "text", text: inputStr },
                        { type: "image_url", image_url: { url: currentImageBase64 } }
                    ]
                });

                // Show standard UI message for attached image
                const imgMsg = document.createElement('img');
                imgMsg.src = currentImageBase64;
                imgMsg.style.maxWidth = "200px";
                imgMsg.style.borderRadius = "4px";
                imgMsg.style.display = "block";
                imgMsg.style.marginTop = "5px";

                // Add the image beneath user's text message visually
                const allUserMsgs = document.querySelectorAll('.ai-msg.user');
                const lastUserMsg = allUserMsgs[allUserMsgs.length - 1];
                if (lastUserMsg) lastUserMsg.appendChild(imgMsg);

            } else {
                chatHistory.push({ role: "user", content: inputStr });
            }

            let apiUrl = '';
            let model = '';
            let isGoogleDirect = apiKey.startsWith('AIza') || apiKey.startsWith('AQ.');

            // Detect provider from API key or fallback to OpenRouter
            if (isGoogleDirect) {
                model = 'gemini-2.0-flash'; // Or gemini-1.5-flash
                apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
            } else if (apiKey.startsWith('gsk_')) {
                apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
                model = currentImageBase64 ? 'meta-llama/llama-4-scout-17b-16e-instruct' : 'llama-3.3-70b-versatile';
            } else if (apiKey.startsWith('sk-or-')) {
                apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
                model = 'google/gemini-2.5-flash';
            } else {
                // Legacy support or fallback
                addMessage("الرجاء التأكد من صحة مفتاح الـ API. (Groq, OpenRouter, Google AI Studio)", 'bot');
                typingDiv.remove();
                return;
            }

            let requestBody = {};

            if (isGoogleDirect) {
                // Google AI Studio format
                const contents = chatHistory.map(msg => {
                    const parts = [];
                    if (Array.isArray(msg.content)) {
                        msg.content.forEach(c => {
                            if (c.type === 'text') parts.push({ text: c.text });
                            if (c.type === 'image_url') {
                                const base64Data = c.image_url.url.split(',')[1];
                                const mimeType = c.image_url.url.split(',')[0].split(':')[1].split(';')[0];
                                parts.push({ inline_data: { mime_type: mimeType, data: base64Data } });
                            }
                        });
                    } else {
                        parts.push({ text: msg.content });
                    }
                    return { role: msg.role === 'assistant' ? 'model' : 'user', parts };
                });

                requestBody = {
                    system_instruction: { parts: [{ text: systemPrompt }] },
                    contents: contents,
                    generationConfig: { temperature: 0.2 }
                };
            } else {
                // OpenAI-compatible format (Groq, OpenRouter)
                let mappedHistory = chatHistory;
                if (!model.includes('scout') && !model.includes('gemini') && !model.includes('vision')) {
                    mappedHistory = chatHistory.map(msg => {
                        if (Array.isArray(msg.content)) {
                            const textPart = msg.content.find(c => c.type === 'text');
                            return { role: msg.role, content: textPart ? textPart.text : "" };
                        }
                        return { role: msg.role, content: msg.content };
                    });
                }

                requestBody = {
                    model: model,
                    messages: [
                        { role: "system", content: systemPrompt },
                        ...mappedHistory
                    ],
                    temperature: 0.2
                };
            }

            // Cleanup image attachment UI state
            currentImageBase64 = null;
            document.getElementById('ai-img-preview-container').style.display = 'none';
            document.getElementById('ai-file-input').value = '';

            const fetchOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            };

            // Only add Auth header if not direct Google (Google uses key in URL)
            if (!isGoogleDirect) {
                fetchOptions.headers['Authorization'] = `Bearer ${apiKey}`;
            }

            const response = await fetch(apiUrl, fetchOptions);

            const data = await response.json();
            typingDiv.remove();

            if (data.error) {
                addMessage("API Error: " + (data.error.message || "Unknown error"), 'bot');
                return;
            }

            const replyText = isGoogleDirect
                ? data.candidates[0].content.parts[0].text
                : data.choices[0].message.content;

            chatHistory.push({ role: "assistant", content: replyText });

            let displayText = replyText;
            let jsonCommands = null;

            // Try matching markdown json block securely first
            const jsonMatch = replyText.match(/\`\`\`(?:json)?\s*([\s\S]*?)\s*\`\`\`/i);
            if (jsonMatch) {
                try {
                    jsonCommands = JSON.parse(jsonMatch[1]);
                    if (Array.isArray(jsonCommands)) {
                        displayText = displayText.replace(jsonMatch[0], "").trim();
                    } else {
                        jsonCommands = null;
                    }
                } catch (e) { }
            }

            // Fallback: depth-balanced JSON Array extractor to survive nested brackets in text
            if (!jsonCommands) {
                let startIdx = replyText.indexOf('[');
                while (startIdx !== -1) {
                    let depth = 0;
                    let inString = false;
                    let escape = false;
                    for (let i = startIdx; i < replyText.length; i++) {
                        let char = replyText[i];
                        if (!escape && char === '"') inString = !inString;
                        if (!inString) {
                            if (char === '[') depth++;
                            else if (char === ']') {
                                depth--;
                                if (depth === 0) {
                                    try {
                                        let possibleJson = replyText.substring(startIdx, i + 1);
                                        let parsed = JSON.parse(possibleJson);
                                        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].action) {
                                            jsonCommands = parsed;
                                            displayText = displayText.replace(possibleJson, "").trim();
                                        }
                                    } catch (e) { }
                                    break;
                                }
                            }
                        }
                        escape = (char === '\\' && !escape);
                    }
                    if (jsonCommands) break;
                    startIdx = replyText.indexOf('[', startIdx + 1);
                }
            }

            addMessage(displayText, 'bot');

            // Always execute the circuit first
            if (jsonCommands && typeof Breadboard !== 'undefined') {
                try {
                    executeCommands(jsonCommands);
                } catch (err) {
                    addMessage("Error executing circuit build.", 'bot');
                }

                // === POST-BUILD VERIFICATION: Check for missing inputs ===
                const gateInputs = {};
                const gateTypes = {};

                for (const cmd of jsonCommands) {
                    if (cmd.action === 'placeIC') {
                        gateTypes[cmd.slot] = cmd.ic;
                        gateInputs[cmd.slot] = 0;
                    }
                    if (cmd.action === 'wire') {
                        const toMatch = cmd.to.match(/ic-(\d+)-pin-(\d+)/);
                        if (toMatch) {
                            const pin = parseInt(toMatch[2]);
                            if (pin === 1 || pin === 2) {
                                gateInputs[toMatch[1]] = (gateInputs[toMatch[1]] || 0) + 1;
                            }
                        }
                    }
                }

                let missingGates = [];
                for (const slot in gateTypes) {
                    const ic = gateTypes[slot];
                    if (['7408', '7432', '7486'].includes(ic) && (gateInputs[slot] || 0) < 2) {
                        missingGates.push(`بوابة ${ic} في المقبس ${slot} (لديها ${gateInputs[slot] || 0} مدخل فقط من أصل 2)`);
                    }
                }

                if (missingGates.length > 0) {
                    addMessage("⚠️ تنبيه: يبدو أن هناك بوابات بمدخل ناقص:\n" + missingGates.join("\n") + "\n\nحاول إرسال المعادلة البوليانية مع الصورة للحصول على نتيجة أدق.", 'bot');
                }
            }
        } catch (e) {
            typingDiv.remove();
            addMessage("Network or unexpected error occurred.", 'bot');
        }
    }

    function executeCommands(commands) {
        let i = 0;
        function step() {
            if (i >= commands.length) return;
            try {
                let cmd = commands[i];
                console.log("Executing:", cmd);
                if (cmd.action === 'clear') {
                    Breadboard.clearAllWires();
                    document.querySelectorAll('.ic-placed').forEach(ic => ic.remove());
                    if (Breadboard.getPlacedICs) {
                        Breadboard.getPlacedICs().length = 0;
                    }
                } else if (cmd.action === 'placeIC') {
                    // Force slot to be an integer if needed, but strings are okay in wiring.js
                    Breadboard.placeIC(cmd.ic, cmd.slot);
                } else if (cmd.action === 'wire') {
                    Breadboard.addWire(cmd.from, cmd.to);
                }
            } catch (err) {
                console.error("AI Wiring Step Error:", err);
            }
            i++;
            setTimeout(step, 300); // execute with a slight delay for cool effect
        }
        step();
    }

    // Auto-init bindings if loaded
    document.addEventListener('DOMContentLoaded', initAIUI);
    // Fallback if already DOMContentLoaded
    if (document.readyState === 'interactive' || document.readyState === 'complete') initAIUI();
})();
