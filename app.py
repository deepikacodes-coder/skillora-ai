from flask import Flask, request, jsonify
from flask_cors import CORS
from pypdf import PdfReader
from io import BytesIO
import re


# ==========================================
# FLASK APP
# ==========================================

app = Flask(__name__)

CORS(app)


# Maximum PDF size = 5 MB
app.config["MAX_CONTENT_LENGTH"] = 5 * 1024 * 1024


# ==========================================
# HEALTH CHECK
# ==========================================

@app.route("/api/health", methods=["GET"])
def health():

    return jsonify({
        "status": "success",
        "message": "Skillora AI backend is running!"
    })


# ==========================================
# RESUME TEXT EXTRACTION
# ==========================================

@app.route("/api/extract-resume", methods=["POST"])
def extract_resume():

    # Check file
    if "resume" not in request.files:

        return jsonify({
            "error": "Please upload a resume PDF."
        }), 400


    file = request.files["resume"]


    # Check filename
    if not file.filename:

        return jsonify({
            "error": "No file selected."
        }), 400


    # Check PDF
    if not file.filename.lower().endswith(".pdf"):

        return jsonify({
            "error": "Only PDF files are supported."
        }), 400


    try:

        # Read PDF directly
        pdf_data = BytesIO(file.read())

        reader = PdfReader(pdf_data)


        # Check encrypted PDF
        if reader.is_encrypted:

            return jsonify({
                "error": "Please upload an unencrypted PDF."
            }), 400


        # Extract text from all pages
        resume_text = "\n".join(
            page.extract_text() or ""
            for page in reader.pages
        )


        # Check readable text
        if not resume_text.strip():

            return jsonify({
                "error": (
                    "No readable text found. "
                    "The PDF may be scanned or image-based."
                )
            }), 400


        return jsonify({

            "status": "success",

            "message": "Resume text extracted successfully!",

            "page_count": len(reader.pages),

            "resume_text": resume_text

        })


    except Exception as error:

        print("PDF Error:", error)

        return jsonify({

            "error": (
                "Unable to read this PDF. "
                "Please try another file."
            )

        }), 400


# ==========================================
# FILE TOO LARGE
# ==========================================

@app.errorhandler(413)
def file_too_large(error):

    return jsonify({

        "error": "File is too large. Maximum size is 5 MB."

    }), 413


# ==========================================
# RUN SERVER
# ==========================================

if __name__ == "__main__":

    app.run(
        debug=True,
        port=5000
    )