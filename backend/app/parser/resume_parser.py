import fitz  # PyMuPDF


def extract_text(pdf_path: str) -> str:
    """
    Extracts all text from a PDF file.

    Args:
        pdf_path: Path to the PDF.

    Returns:
        A single string containing all extracted text.
    """

    text = ""

    with fitz.open(pdf_path) as pdf:
        for page in pdf:
            text += page.get_text()

    return text.strip()