from fastapi import APIRouter, UploadFile, File, HTTPException
import fitz  # PyMuPDF
import os

router = APIRouter()

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """
    Upload and process a PDF or TXT file to extract its text content.
    
    Args:
        file (UploadFile): The file to be uploaded (PDF or TXT)
        
    Returns:
        dict: Response containing the extracted text
        
    Raises:
        HTTPException: If no file is uploaded, file type is unsupported,
                      or there's an error processing the file
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded")

    # Get file extension and convert to lowercase
    file_extension = os.path.splitext(file.filename)[1].lower()

    # Process file based on its type
    if file_extension == '.pdf':
        content = await file.read()
        try:
            # Open PDF and extract text from each page
            doc = fitz.open(stream=content, filetype="pdf")
            text = ""
            for page in doc:
                text += page.get_text()
            doc.close()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")
    elif file_extension == '.txt':
        # Read and decode text file
        content = await file.read()
        text = content.decode('utf-8')
    else:
        raise HTTPException(status_code=400, detail="Unsupported file type. Please upload a PDF or TXT file.")

    return {"text": text} 