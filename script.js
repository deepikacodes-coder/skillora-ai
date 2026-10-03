// =====================================================
// SKILLORA AI - RESUME ANALYZER
// =====================================================

const API_URL = "http://127.0.0.1:5000";

// =====================================================
// GET HTML ELEMENTS
// =====================================================

const resumeInput =
    document.getElementById("resumeFile") ||
    document.querySelector('input[type="file"]');

const targetJobRole =
    document.getElementById("targetJobRole") ||
    document.getElementById("jobRole");

const jobDescription =
    document.getElementById("jobDescription");

const analyzeBtn =
    document.getElementById("analyzeBtn");

const statusMessage =
    document.getElementById("statusMessage");

const resultSection =
    document.getElementById("resultSection");


// =====================================================
// SKILLS DATABASE
// =====================================================

const skills = [
    "Python",
    "JavaScript",
    "TypeScript",
    "Java",
    "C++",

    "HTML",
    "CSS",

    "SQL",
    "MySQL",
    "MongoDB",
    "SQLite",

    "Flask",
    "FastAPI",
    "Node.js",
    "Express.js",

    "REST API",
    "API Integration",

    "Artificial Intelligence",
    "AI",
    "Machine Learning",
    "Deep Learning",
    "Generative AI",

    "AI Agent",
    "AI Agents",
    "Agentic AI",

    "LLM",
    "LLMs",
    "Large Language Models",

    "Prompt Engineering",
    "LangChain",
    "LangGraph",
    "RAG",

    "Natural Language Processing",
    "OpenAI API",

    "Git",
    "GitHub",

    "Problem Solving",
    "Logical Problem Solving",

    "Communication",
    "Teamwork",

    "System Design",
    "Workflow Design",

    "Testing",
    "Debugging",
    "Deployment",
    "Automation"
];


// =====================================================
// FILE SELECTION
// =====================================================

if (resumeInput) {

    resumeInput.addEventListener("change", function () {

        const file = this.files[0];

        if (!file) {
            return;
        }

        // Check PDF
        if (
            file.type !== "application/pdf" &&
            !file.name.toLowerCase().endsWith(".pdf")
        ) {

            showStatus(
                "Please upload a PDF file.",
                "error"
            );

            this.value = "";
            return;
        }

        // Check size - 5 MB
        if (file.size > 5 * 1024 * 1024) {

            showStatus(
                "File size must be less than 5 MB.",
                "error"
            );

            this.value = "";
            return;
        }

        showStatus(
            `${file.name} selected successfully.`,
            "success"
        );
    });
}


// =====================================================
// START ANALYSIS
// =====================================================

if (analyzeBtn) {

    analyzeBtn.addEventListener("click", async function () {

        const file = resumeInput?.files[0];

        // IMPORTANT:
        // Supports both targetJobRole and jobRole
        const role =
            targetJobRole?.value.trim() || "";

        const jd =
            jobDescription?.value.trim() || "";


        // =================================================
        // VALIDATION
        // =================================================

        if (!file) {

            showStatus(
                "Please upload your resume.",
                "error"
            );

            return;
        }


        if (!role) {

            showStatus(
                "Please enter the target job role.",
                "error"
            );

            return;
        }


        if (!jd) {

            showStatus(
                "Please enter the job description.",
                "error"
            );

            return;
        }


        // =================================================
        // LOADING
        // =================================================

        analyzeBtn.disabled = true;
        analyzeBtn.innerText = "Analyzing...";

        showStatus(
            "Analyzing your resume...",
            "loading"
        );


        try {

            // =================================================
            // SEND RESUME TO FLASK
            // =================================================

            const formData = new FormData();

            formData.append("resume", file);


            const response = await fetch(
                `${API_URL}/api/extract-resume`,
                {
                    method: "POST",
                    body: formData
                }
            );


            const data = await response.json();


            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Unable to analyze resume."
                );
            }


            // =================================================
            // RESUME TEXT
            // =================================================

            const resumeText =
                data.resume_text || "";


            if (!resumeText.trim()) {

                throw new Error(
                    "No readable text found in the resume."
                );
            }


            // =================================================
            // JOB TEXT
            // =================================================

            const jobText =
                `${role} ${jd}`.toLowerCase();


            const resumeLower =
                resumeText.toLowerCase();


            // =================================================
            // FIND REQUIRED SKILLS
            // =================================================

            const requiredSkills =
                skills.filter(skill => {

                    return jobText.includes(
                        skill.toLowerCase()
                    );

                });


            // =================================================
            // FIND MATCHING SKILLS
            // =================================================

            const matchingSkills =
                requiredSkills.filter(skill => {

                    return containsSkill(
                        resumeLower,
                        skill
                    );

                });


            // =================================================
            // FIND MISSING SKILLS
            // =================================================

            const missingSkills =
                requiredSkills.filter(skill => {

                    return !containsSkill(
                        resumeLower,
                        skill
                    );

                });


            // =================================================
            // CALCULATE SCORE
            // =================================================

            let score = 0;

            if (requiredSkills.length > 0) {

                score = Math.round(
                    (
                        matchingSkills.length /
                        requiredSkills.length
                    ) * 100
                );

            }


            // Keep score between 0 - 100

            score = Math.max(
                0,
                Math.min(100, score)
            );


            // =================================================
            // SUGGESTIONS
            // =================================================

            const suggestions = [];


            if (missingSkills.length > 0) {

                suggestions.push(
                    "Add relevant keywords such as " +
                    missingSkills
                        .slice(0, 3)
                        .join(", ") +
                    " naturally in your resume."
                );

                suggestions.push(
                    "Consider adding projects related " +
                    "to the missing skills."
                );

            } else {

                suggestions.push(
                    "Your resume contains the recognized " +
                    "skills from this job description."
                );

            }


            suggestions.push(
                "Keep relevant technical skills " +
                "visible and clearly written."
            );


            // =================================================
            // CREATE CANDIDATE OBJECT
            // =================================================

            const candidate = {

                id: Date.now(),

                name: extractCandidateName(
                    resumeText,
                    file.name
                ),

                email: extractEmail(
                    resumeText
                ),

                phone: extractPhone(
                    resumeText
                ),

                location: extractLocation(
                    resumeText
                ),

                resume: file.name,

                score: score,

                matchingSkills:
                    matchingSkills,

                missingSkills:
                    missingSkills,

                targetJobRole:
                    role,

                jobDescription:
                    jd,

                analyzedAt:
                    new Date().toISOString()

            };


            // =================================================
            // SAVE CANDIDATE
            // =================================================

            let candidates = [];

            try {

                candidates =
                    JSON.parse(
                        localStorage.getItem(
                            "skilloraCandidates"
                        ) || "[]"
                    );

                if (!Array.isArray(candidates)) {
                    candidates = [];
                }

            } catch (error) {

                console.error(
                    "Unable to read saved candidates:",
                    error
                );

                candidates = [];
            }


            // =================================================
            // PREVENT DUPLICATE RESUME
            // =================================================

            const existingIndex =
                candidates.findIndex(
                    existingCandidate =>
                        existingCandidate.resume ===
                        candidate.resume
                );


            if (existingIndex !== -1) {

                // Update existing candidate
                candidates[existingIndex] =
                    candidate;

            } else {

                // Add new candidate
                candidates.push(candidate);

            }


            // =================================================
            // SAVE TO LOCAL STORAGE
            // =================================================

            localStorage.setItem(
                "skilloraCandidates",
                JSON.stringify(candidates)
            );


            // =================================================
            // DISPLAY RESULT
            // =================================================

            displayResults(
                score,
                matchingSkills,
                missingSkills,
                suggestions,
                resumeText
            );


            // =================================================
            // SHOW RANKING BUTTON
            // =================================================

            const rankingButtonContainer =
                document.getElementById(
                    "rankingButtonContainer"
                );

            if (rankingButtonContainer) {

                rankingButtonContainer.style.display =
                    "block";

            }


            // =================================================
            // SUCCESS MESSAGE
            // =================================================

            showStatus(
                "Analysis completed successfully!",
                "success"
            );


        } catch (error) {

            console.error(
                "Analysis Error:",
                error
            );


            showStatus(
                error.message ||
                "Something went wrong.",
                "error"
            );


        } finally {

            analyzeBtn.disabled = false;

            analyzeBtn.innerText =
                "Start Analysis";

        }

    });

}


// =====================================================
// SKILL MATCH HELPER
// =====================================================

function containsSkill(text, skill) {

    const normalizedText =
        text.toLowerCase();

    const normalizedSkill =
        skill.toLowerCase();


    // Normal direct match

    if (
        normalizedText.includes(
            normalizedSkill
        )
    ) {
        return true;
    }


    // Handle common variations

    const variations = {

        "AI Agent": [
            "ai agent",
            "ai agents",
            "agentic ai"
        ],

        "AI Agents": [
            "ai agent",
            "ai agents",
            "agentic ai"
        ],

        "LLM": [
            "llm",
            "llms",
            "large language model",
            "large language models"
        ],

        "LLMs": [
            "llm",
            "llms",
            "large language model",
            "large language models"
        ],

        "REST API": [
            "rest api",
            "restful api",
            "rest"
        ],

        "JavaScript": [
            "javascript",
            "java script"
        ],

        "Node.js": [
            "node.js",
            "nodejs",
            "node js"
        ],

        "Express.js": [
            "express.js",
            "expressjs",
            "express js"
        ]

    };


    if (variations[skill]) {

        return variations[skill].some(
            variation =>
                normalizedText.includes(
                    variation
                )
        );

    }


    return false;
}


// =====================================================
// DISPLAY RESULTS
// =====================================================

function displayResults(
    score,
    matchingSkills,
    missingSkills,
    suggestions,
    resumeText
) {

    // =================================================
    // SHOW RESULT SECTION
    // =================================================

    if (resultSection) {

        resultSection.style.display =
            "block";

    }


    // =================================================
    // JOB MATCH SCORE
    // =================================================

    const scoreElements = [

        document.getElementById(
            "jobMatchScore"
        ),

        document.getElementById(
            "matchScore"
        ),

        document.querySelector(
            ".job-match-score"
        ),

        document.querySelector(
            ".score-value"
        )

    ];


    scoreElements.forEach(element => {

        if (element) {

            element.textContent =
                `${score}%`;

        }

    });


    // =================================================
    // ATS SCORE
    // =================================================

    const atsElements = [

        document.getElementById(
            "atsScore"
        ),

        document.querySelector(
            ".ats-score"
        )

    ];


    atsElements.forEach(element => {

        if (element) {

            element.textContent =
                `${score}%`;

        }

    });


    // =================================================
    // KEYWORD MATCH
    // =================================================

    const keywordElements = [

        document.getElementById(
            "keywordMatch"
        ),

        document.querySelector(
            ".keyword-match"
        )

    ];


    keywordElements.forEach(element => {

        if (element) {

            element.textContent =
                `${score}%`;

        }

    });


    // =================================================
    // MATCHING SKILLS
    // =================================================

    const matchingContainer =
        document.getElementById(
            "matchingSkills"
        );


    if (matchingContainer) {

        matchingContainer.innerHTML = "";


        if (matchingSkills.length === 0) {

            matchingContainer.innerHTML =
                "<li>No matching skills found</li>";

        } else {

            matchingSkills.forEach(skill => {

                const li =
                    document.createElement(
                        "li"
                    );

                li.textContent =
                    `✓ ${skill}`;

                matchingContainer.appendChild(
                    li
                );

            });

        }

    }


    // =================================================
    // MISSING SKILLS
    // =================================================

    const missingContainer =
        document.getElementById(
            "missingSkills"
        );


    if (missingContainer) {

        missingContainer.innerHTML = "";


        if (missingSkills.length === 0) {

            missingContainer.innerHTML =
                "<li>No major missing skills detected</li>";

        } else {

            missingSkills.forEach(skill => {

                const li =
                    document.createElement(
                        "li"
                    );

                li.textContent =
                    `− ${skill}`;

                missingContainer.appendChild(
                    li
                );

            });

        }

    }


    // =================================================
    // SUGGESTIONS
    // =================================================

    const suggestionsContainer =
        document.getElementById(
            "suggestions"
        );


    if (suggestionsContainer) {

        suggestionsContainer.innerHTML = "";


        suggestions.forEach(
            suggestion => {

                const li =
                    document.createElement(
                        "li"
                    );

                li.textContent =
                    `→ ${suggestion}`;

                suggestionsContainer.appendChild(
                    li
                );

            }
        );

    }


    // =================================================
    // RESUME STRUCTURE
    // =================================================

    checkResumeStructure(
        resumeText
    );


    // =================================================
    // SCROLL TO RESULT
    // =================================================

    if (resultSection) {

        resultSection.scrollIntoView({
            behavior: "smooth"
        });

    }

}


// =====================================================
// RESUME STRUCTURE CHECK
// =====================================================

function checkResumeStructure(resumeText) {

    const text = resumeText.toLowerCase();

    const sections = {

        "Professional Summary": [
            "summary",
            "profile",
            "objective",
            "about me"
        ],

        "Education": [
            "education",
            "academic",
            "qualification",
            "degree"
        ],

        "Technical Skills": [
            "skills",
            "technical skills",
            "technical"
        ],

        "Experience": [
            "experience",
            "internship",
            "work experience",
            "professional experience"
        ],

        "Projects": [
            "projects",
            "project",
            "academic projects",
            "personal projects"
        ],

        "Certifications": [
            "certification",
            "certifications",
            "certificate"
        ]

    };


    Object.keys(sections).forEach(sectionName => {

        const keywords =
            sections[sectionName];

        const found =
            keywords.some(keyword =>
                text.includes(keyword.toLowerCase())
            );


        const element =
            document.querySelector(
                `[data-section="${sectionName}"]`
            );


        if (!element) {
            return;
        }


        const icon =
            element.querySelector(
                ".structure-icon"
            );


        if (found) {

            element.classList.add("found");

            if (icon) {
                icon.textContent = "✓";
            }

        } else {

            element.classList.remove("found");

            if (icon) {
                icon.textContent = "○";
            }

        }

    });

}

// =====================================================
// EXTRACT NAME
// =====================================================

function extractCandidateName(
    text,
    filename
) {

    const lines =
        text
            .split(/\r?\n/)
            .map(line => line.trim())
            .filter(
                line => line.length > 0
            );


    const unwantedWords = [

        "resume",
        "curriculum vitae",
        "software developer",
        "ai agent developer",
        "student",
        "engineer",
        "professional summary",
        "technical skills",
        "education",
        "experience",
        "projects",
        "certifications",
        "skills",
        "email",
        "phone",
        "contact",

        "tamil nadu",
        "erode",
        "coimbatore",
        "chennai",
        "salem",
        "madurai",
        "bangalore",
        "bengaluru",
        "hyderabad",
        "kochi",
        "pune",
        "mumbai",
        "delhi"

    ];


    // Check first 15 lines

    for (
        let i = 0;
        i < Math.min(
            lines.length,
            15
        );
        i++
    ) {

        const line =
            lines[i];

        const lowerLine =
            line.toLowerCase();


        // Skip email

        if (line.includes("@")) {
            continue;
        }


        // Skip phone / numbers

        if (/\d{5,}/.test(line)) {
            continue;
        }


        // Skip URLs

        if (
            lowerLine.includes("http://") ||
            lowerLine.includes("https://") ||
            lowerLine.includes("www.")
        ) {
            continue;
        }


        // Length check

        if (
            line.length < 3 ||
            line.length > 40
        ) {
            continue;
        }


        // Skip unwanted headings / locations

        if (
            unwantedWords.some(
                word =>
                    lowerLine.includes(word)
            )
        ) {
            continue;
        }


        // Name-like text

        if (
            /^[A-Za-z .'-]+$/.test(line)
        ) {

            const words =
                line.split(/\s+/);


            if (
                words.length >= 2 &&
                words.length <= 5
            ) {

                return line;

            }

        }

    }


    // =================================================
    // FALLBACK - FILE NAME
    // =================================================

    let fallbackName =
        filename
            .replace(
                /\.pdf$/i,
                ""
            )
            .replace(
                /[_-]/g,
                " "
            )
            .replace(
                /\bresume\b/gi,
                ""
            )
            .trim();


    return fallbackName ||
        "Unknown Candidate";

}


// =====================================================
// EXTRACT EMAIL
// =====================================================

function extractEmail(
    text
) {

    const match =
        text.match(
            /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i
        );


    return match
        ? match[0]
        : "Not available";

}


// =====================================================
// EXTRACT PHONE
// =====================================================

function extractPhone(
    text
) {

    const match =
        text.match(
            /(?:\+91[\s-]?)?[6-9]\d{9}/
        );


    return match
        ? match[0]
        : "Not available";

}


// =====================================================
// EXTRACT LOCATION
// =====================================================

function extractLocation(
    text
) {

    const locations = [

        "Tamil Nadu",
        "Chennai",
        "Coimbatore",
        "Erode",
        "Salem",
        "Madurai",
        "Bangalore",
        "Bengaluru",
        "Hyderabad",
        "Kerala",
        "Karnataka"

    ];


    const lowerText =
        text.toLowerCase();


    for (
        const location of locations
    ) {

        if (
            lowerText.includes(
                location.toLowerCase()
            )
        ) {

            return location;

        }

    }


    return "Not available";

}


// =====================================================
// STATUS MESSAGE
// =====================================================

function showStatus(
    message,
    type
) {

    if (!statusMessage) {
        return;
    }


    statusMessage.textContent =
        message;


    statusMessage.className =
        "status-message";


    if (type) {

        statusMessage.classList.add(
            type
        );

    }

}



    function openCandidateRankings() {
    window.location.href = "rankings.html";
}

window.openCandidateRankings = openCandidateRankings;