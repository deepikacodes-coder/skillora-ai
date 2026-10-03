// ==========================================
// SKILLORA AI - CANDIDATE RANKINGS
// ==========================================

const API_URL = "http://127.0.0.1:5000";

// ==========================================
// HTML ELEMENTS
// ==========================================

const resumeFiles = document.getElementById("resumeFiles");
const selectedFiles = document.getElementById("selectedFiles");

const jobRole = document.getElementById("jobRole");
const jobDescription = document.getElementById("jobDescription");

const analyzeCandidatesBtn =
    document.getElementById("analyzeCandidatesBtn");

const statusMessage =
    document.getElementById("statusMessage");

const summarySection =
    document.getElementById("summarySection");

const totalCandidates =
    document.getElementById("totalCandidates");

const bestMatch =
    document.getElementById("bestMatch");

const candidatesReviewed =
    document.getElementById("candidatesReviewed");

const averageScore =
    document.getElementById("averageScore");

const topCandidateName =
    document.getElementById("topCandidateName");

const topCandidateEmail =
    document.getElementById("topCandidateEmail");

const topCandidatePhone =
    document.getElementById("topCandidatePhone");

const topCandidateLocation =
    document.getElementById("topCandidateLocation");

const topCandidateResume =
    document.getElementById("topCandidateResume");

const topCandidateScore =
    document.getElementById("topCandidateScore");

const rankingTableBody =
    document.getElementById("rankingTableBody");

const sortCandidates =
    document.getElementById("sortCandidates");

const candidateModal =
    document.getElementById("candidateModal");

const candidateDetails =
    document.getElementById("candidateDetails");

const closeModal =
    document.getElementById("closeModal");

const viewAnalysisBtn =
    document.getElementById("viewAnalysisBtn");

// ==========================================
// SKILLS DATABASE
// ==========================================

const skills = [
    "Python",
    "Java",
    "C++",
    "JavaScript",
    "TypeScript",

    "HTML",
    "HTML5",
    "CSS",
    "CSS3",

    "SQL",
    "MySQL",
    "MongoDB",
    "SQLite",

    "Flask",
    "FastAPI",

    "Node.js",
    "Express.js",

    "REST API",
    "REST APIs",
    "API Integration",

    "Artificial Intelligence",
    "AI",
    "Machine Learning",
    "Generative AI",

    "AI Agent",
    "AI Agents",
    "Agentic AI",

    "LLM",
    "LLMs",
    "Large Language Models",
    "LLM Applications",

    "Prompt Engineering",

    "LangChain",
    "LangGraph",
    "RAG",

    "Natural Language Processing",

    "OpenAI API",
    "Gemini API",

    "Git",
    "GitHub",

    "Problem Solving",
    "Logical Problem Solving",

    "Communication",
    "Teamwork",

    "System Design",

    "Testing",
    "Software Testing",

    "Debugging",
    "Deployment",
    "Automation",
    "Workflow Design",

    "Data Structures",
    "Algorithms",

    "OOP",
    "Object-Oriented Programming"
];

// ==========================================
// CANDIDATE STORAGE
// ==========================================

let candidates = [];
let selectedCandidate = null;

// ==========================================
// NORMALIZE TEXT
// ==========================================

function normalizeText(text) {
    return text
        .toLowerCase()
        .replace(/[^\w\s+#.-]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

// ==========================================
// CHECK SKILL
// ==========================================

function containsSkill(text, skill) {

    const normalizedText = normalizeText(text);
    const normalizedSkill = normalizeText(skill);

    return normalizedText.includes(normalizedSkill);
}

// ==========================================
// GET MATCHING SKILLS
// ==========================================

function getMatchingSkills(resumeText, jobText) {

    const requiredSkills = skills.filter(skill =>
        containsSkill(jobText, skill)
    );

    const matchingSkills = requiredSkills.filter(skill =>
        containsSkill(resumeText, skill)
    );

    return {
        requiredSkills,
        matchingSkills
    };
}

// ==========================================
// CALCULATE SCORE
// ==========================================

function calculateScore(resumeText, jobText) {

    const result = getMatchingSkills(
        resumeText,
        jobText
    );

    if (result.requiredSkills.length === 0) {
        return {
            score: 0,
            matchingSkills: [],
            missingSkills: []
        };
    }

    const matching = result.matchingSkills;

    const missing = result.requiredSkills.filter(
        skill => !matching.includes(skill)
    );

    const score = Math.round(
        (matching.length / result.requiredSkills.length) * 100
    );

    return {
        score: score,
        matchingSkills: matching,
        missingSkills: missing
    };
}

// ==========================================
// EXTRACT NAME - FIXED
// ==========================================

function extractName(text, fileName) {

    const lines = text
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(line => line.length > 0);

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

    // Check first 15 lines of resume
    for (let i = 0; i < Math.min(lines.length, 15); i++) {

        const line = lines[i];
        const lowerLine = line.toLowerCase();

        // Skip email
        if (line.includes("@")) {
            continue;
        }

        // Skip phone numbers
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

        // Skip very short or very long lines
        if (line.length < 3 || line.length > 40) {
            continue;
        }

        // Skip unwanted words
        if (
            unwantedWords.some(word =>
                lowerLine.includes(word)
            )
        ) {
            continue;
        }

        // Accept name-like text
        if (/^[A-Za-z .'-]+$/.test(line)) {

            const words = line.split(/\s+/);

            // Name generally contains 2-5 words
            if (words.length >= 2 && words.length <= 5) {
                return line;
            }
        }
    }

    // Filename fallback
    let fallbackName = fileName
        .replace(/\.pdf$/i, "")
        .replace(/[_-]/g, " ")
        .replace(/\bresume\b/gi, "")
        .trim();

    return fallbackName || "Unknown Candidate";
}

// ==========================================
// EXTRACT EMAIL
// ==========================================

function extractEmail(text) {

    const match = text.match(
        /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i
    );

    return match
        ? match[0]
        : "Not detected";
}

// ==========================================
// EXTRACT PHONE
// ==========================================

function extractPhone(text) {

    const match = text.match(
        /(?:\+91[\s-]?)?[6-9]\d{9}/
    );

    return match
        ? match[0]
        : "Not detected";
}

// ==========================================
// EXTRACT LOCATION
// ==========================================

function extractLocation(text) {

    const locationKeywords = [
        "Tamil Nadu",
        "Chennai",
        "Coimbatore",
        "Erode",
        "Salem",
        "Madurai",
        "Bangalore",
        "Bengaluru",
        "Hyderabad",
        "Kochi",
        "Pune",
        "Mumbai",
        "Delhi"
    ];

    for (const location of locationKeywords) {

        if (
            text.toLowerCase().includes(
                location.toLowerCase()
            )
        ) {
            return location;
        }
    }

    return "Not detected";
}

// ==========================================
// DISPLAY SELECTED FILES
// ==========================================

resumeFiles.addEventListener("change", function () {

    selectedFiles.innerHTML = "";

    const files = Array.from(resumeFiles.files);

    if (files.length === 0) {
        return;
    }

    if (files.length > 10) {

        statusMessage.textContent =
            "Maximum 10 PDF files can be uploaded.";

        resumeFiles.value = "";
        return;
    }

    for (const file of files) {

        if (file.type !== "application/pdf") {

            statusMessage.textContent =
                "Only PDF files are supported.";

            resumeFiles.value = "";
            selectedFiles.innerHTML = "";

            return;
        }

        if (file.size > 5 * 1024 * 1024) {

            statusMessage.textContent =
                `${file.name} is larger than 5 MB.`;

            resumeFiles.value = "";
            selectedFiles.innerHTML = "";

            return;
        }

        const fileBox = document.createElement("div");

        fileBox.className = "selected-file";

        fileBox.textContent = "📄 " + file.name;

        selectedFiles.appendChild(fileBox);
    }
});

// ==========================================
// ANALYZE ONE RESUME
// ==========================================

async function analyzeResume(file) {

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
            data.error || "Unable to analyze resume."
        );
    }

    const resumeText = data.resume_text || "";

    const jobText =
        `${jobRole.value} ${jobDescription.value}`;

    const result =
        calculateScore(
            resumeText,
            jobText
        );

    return {
        id: Date.now() + Math.random(),

        name: extractName(
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

        fileName: file.name,

        score: result.score,

        matchingSkills:
            result.matchingSkills,

        missingSkills:
            result.missingSkills,

        resumeText: resumeText
    };
}

// ==========================================
// UPDATE SUMMARY
// ==========================================

function updateSummary() {

    totalCandidates.textContent =
        candidates.length;

    candidatesReviewed.textContent =
        candidates.length;

    if (candidates.length === 0) {

        bestMatch.textContent = "0%";
        averageScore.textContent = "0%";

        return;
    }

    const scores =
        candidates.map(candidate =>
            candidate.score
        );

    const highest =
        Math.max(...scores);

    const average =
        Math.round(
            scores.reduce(
                (sum, score) =>
                    sum + score,
                0
            ) / scores.length
        );

    bestMatch.textContent =
        `${highest}%`;

    averageScore.textContent =
        `${average}%`;
}

// ==========================================
// UPDATE TOP CANDIDATE
// ==========================================

function updateTopCandidate() {

    if (candidates.length === 0) {
        return;
    }

    const top =
        [...candidates].sort(
            (a, b) =>
                b.score - a.score
        )[0];

    topCandidateName.textContent =
        top.name;

    topCandidateEmail.textContent =
        top.email;

    topCandidatePhone.textContent =
        top.phone;

    topCandidateLocation.textContent =
        top.location;

    topCandidateResume.textContent =
        top.fileName;

    topCandidateScore.textContent =
        `${top.score}%`;
}

// ==========================================
// DISPLAY RANKINGS
// ==========================================

function displayRankings() {

    rankingTableBody.innerHTML = "";

    candidates.forEach(
        (candidate, index) => {

            const row =
                document.createElement("tr");

            // Rank
            const rankCell =
                document.createElement("td");

            rankCell.textContent =
                index + 1;

            // Name
            const nameCell =
                document.createElement("td");

            nameCell.textContent =
                candidate.name;

            // Email
            const emailCell =
                document.createElement("td");

            emailCell.textContent =
                candidate.email;

            // Phone
            const phoneCell =
                document.createElement("td");

            phoneCell.textContent =
                candidate.phone;

            // Location
            const locationCell =
                document.createElement("td");

            locationCell.textContent =
                candidate.location;

            // Resume
            const resumeCell =
                document.createElement("td");

            resumeCell.textContent =
                candidate.fileName;

            // Skills
            const skillsCell =
                document.createElement("td");

            skillsCell.textContent =
                candidate.matchingSkills.length > 0
                    ? candidate.matchingSkills.join(", ")
                    : "None";

            // Score
            const scoreCell =
                document.createElement("td");

            const scoreContainer =
                document.createElement("div");

            scoreContainer.className =
                "score-container";

            const scoreText =
                document.createElement("span");

            scoreText.textContent =
                `${candidate.score}%`;

            const scoreCircle =
                document.createElement("span");

            scoreCircle.className =
                "score-circle";

            scoreCircle.textContent =
                "";

            scoreContainer.appendChild(
                scoreText
            );

            scoreContainer.appendChild(
                scoreCircle
            );

            scoreCell.appendChild(
                scoreContainer
            );

            // View Details
            const actionCell =
                document.createElement("td");

            const viewButton =
                document.createElement("button");

            viewButton.className =
                "view-details-btn";

            viewButton.textContent =
                "View Details";

            viewButton.addEventListener(
                "click",
                function () {

                    openCandidateDetails(
                        candidate
                    );

                }
            );

            actionCell.appendChild(
                viewButton
            );

            // Add cells
            row.appendChild(rankCell);
            row.appendChild(nameCell);
            row.appendChild(emailCell);
            row.appendChild(phoneCell);
            row.appendChild(locationCell);
            row.appendChild(resumeCell);
            row.appendChild(skillsCell);
            row.appendChild(scoreCell);
            row.appendChild(actionCell);

            rankingTableBody.appendChild(row);
        }
    );
}

// ==========================================
// OPEN CANDIDATE DETAILS
// ==========================================

function openCandidateDetails(candidate) {

    selectedCandidate =
        candidate;

    candidateDetails.innerHTML = "";

    const details = [

        {
            title: "Name",
            value: candidate.name
        },

        {
            title: "Email",
            value: candidate.email
        },

        {
            title: "Phone",
            value: candidate.phone
        },

        {
            title: "Location",
            value: candidate.location
        },

        {
            title: "Resume",
            value: candidate.fileName
        },

        {
            title: "Job Match",
            value: `${candidate.score}%`
        },

        {
            title: "Matching Skills",
            value:
                candidate.matchingSkills.length > 0
                    ? candidate.matchingSkills.join(", ")
                    : "None"
        },

        {
            title: "Missing Skills",
            value:
                candidate.missingSkills.length > 0
                    ? candidate.missingSkills.join(", ")
                    : "None"
        }
    ];

    details.forEach(detail => {

        const box =
            document.createElement("div");

        box.className =
            "modal-detail";

        const title =
            document.createElement("strong");

        title.textContent =
            detail.title;

        const value =
            document.createElement("span");

        value.textContent =
            detail.value;

        box.appendChild(title);
        box.appendChild(value);

        candidateDetails.appendChild(box);
    });

    candidateModal.classList.add("show");
}

// ==========================================
// CLOSE MODAL
// ==========================================

closeModal.addEventListener(
    "click",
    function () {

        candidateModal.classList.remove(
            "show"
        );

    }
);

candidateModal.addEventListener(
    "click",
    function (event) {

        if (
            event.target ===
            candidateModal
        ) {

            candidateModal.classList.remove(
                "show"
            );

        }

    }
);

// ==========================================
// VIEW FULL ANALYSIS
// ==========================================

viewAnalysisBtn.addEventListener(
    "click",
    function () {

        if (!selectedCandidate) {
            return;
        }

        localStorage.setItem(
            "skilloraSelectedCandidate",
            JSON.stringify(
                selectedCandidate
            )
        );

        window.location.href =
            "index.html";
    }
);

// ==========================================
// SORT CANDIDATES
// ==========================================

sortCandidates.addEventListener(
    "change",
    function () {

        if (
            sortCandidates.value ===
            "score"
        ) {

            candidates.sort(
                (a, b) =>
                    b.score - a.score
            );

        } else {

            candidates.sort(
                (a, b) =>
                    a.name.localeCompare(
                        b.name
                    )
            );
        }

        updateTopCandidate();
        displayRankings();
    }
);

// ==========================================
// START ANALYSIS
// ==========================================

analyzeCandidatesBtn.addEventListener(
    "click",
    async function () {

        // Validate resume
        if (
            resumeFiles.files.length === 0
        ) {

            statusMessage.textContent =
                "Please upload at least one resume PDF.";

            return;
        }

        // Validate job role
        if (
            !jobRole.value.trim()
        ) {

            statusMessage.textContent =
                "Please enter the target job role.";

            jobRole.focus();

            return;
        }

        // Validate job description
        if (
            !jobDescription.value.trim()
        ) {

            statusMessage.textContent =
                "Please enter the job description.";

            jobDescription.focus();

            return;
        }

        // Button state
        analyzeCandidatesBtn.disabled =
            true;

        analyzeCandidatesBtn.textContent =
            "Analyzing...";

        statusMessage.textContent =
            "Analyzing candidate resumes...";

        try {

            const files =
                Array.from(
                    resumeFiles.files
                );

            // Analyze every selected resume
            for (
                let i = 0;
                i < files.length;
                i++
            ) {

                statusMessage.textContent =
                    `Analyzing resume ${i + 1} of ${files.length}...`;

                const result =
                    await analyzeResume(
                        files[i]
                    );

                // Prevent duplicate file
                const alreadyExists =
                    candidates.some(
                        candidate =>
                            candidate.fileName ===
                            result.fileName
                    );

                if (!alreadyExists) {

                    candidates.push(
                        result
                    );
                }
            }

            // Highest score first
            candidates.sort(
                (a, b) =>
                    b.score - a.score
            );

            // Update page
            updateSummary();
            updateTopCandidate();
            displayRankings();

            statusMessage.textContent =
                `Candidate analysis completed successfully! ${candidates.length} candidate(s) in ranking.`;

            summarySection.scrollIntoView({
                behavior: "smooth"
            });

        } catch (error) {

            console.error(error);

            if (
                error.message.includes(
                    "Failed to fetch"
                )
            ) {

                statusMessage.textContent =
                    "Cannot connect to the backend. Please make sure python app.py is running.";

            } else {

                statusMessage.textContent =
                    error.message;
            }

        } finally {

            analyzeCandidatesBtn.disabled =
                false;

            analyzeCandidatesBtn.textContent =
                "Start Analysis";
        }
    }
);