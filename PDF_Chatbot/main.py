import shutil
import os
import traceback
from fastapi import FastAPI, File, UploadFile, HTTPException,Form
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from starlette.requests import Request
from langchain_huggingface.embeddings import HuggingFaceEmbeddings
from qdrant_client.http.models import Distance, VectorParams
from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient
from langchain.text_splitter import CharacterTextSplitter
from langchain_cohere import ChatCohere
from langchain_core.messages import HumanMessage
from langchain_core.prompts import PromptTemplate
from PyPDF2 import PdfReader
from dotenv import load_dotenv

app = FastAPI()

load_dotenv()

# Retrieve the Hugging Face API key from the environment
hf_api_key = os.getenv("HF_API_KEY")
cohere_api_key = os.getenv("COHERE_API_KEY")

# Static and templates
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

UPLOAD_DIR = "uploaded_files"
os.makedirs(UPLOAD_DIR, exist_ok=True)


UPLOAD_DIR = "uploaded_files"
VECTOR_DB_PATH = "qdrant_vectorstore"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# Initialize the Qdrant client with in-memory storage
client = QdrantClient(":memory:")


client.delete_collection(collection_name="demo_collection")
# Create a collection for storing embeddings in Qdrant (if not already created)
try:
    client.create_collection(
        collection_name="demo_collection",
        vectors_config=VectorParams(size=384, distance=Distance.COSINE),# Example size of embeddings and distance metric
    )
except Exception as e:
    print(f"Collection already exists or an error occurred: {e}")


# Initialize HuggingFace Embeddings (using SentenceTransformers)
embedding_model = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

# Create a Qdrant vector store (or load it if it already exists)
vector_store = QdrantVectorStore(
    client=client,
    collection_name="demo_collection",
    embedding=embedding_model
)

llm = ChatCohere(cohere_api_key = cohere_api_key)

prompt_template = PromptTemplate(
    input_variables=["context", "question"],
    template=(
        "You are a highly intelligent and helpful assistant specializing in analyzing PDF documents. Your role is to simplify complex narratives, provide clear explanations, and answer questions based on the given context. Always ensure your responses are concise, accurate, and easy to understand. Make sure to answer only questions that are related to the cpntext provided donot enertatain any other requests.\n\n"
        "Context:\n{context}\n\n"
        "Question:\n{question}\n\n"
        "Answer:"
    ),
)


@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.post("/upload/")
async def upload_pdf(file: UploadFile = File(...)):
    # Save the uploaded file
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Extract text from the PDF
    pdf_reader = PdfReader(file_path)
    text = ""
    for page in pdf_reader.pages:
        text += page.extract_text()

    # Split the text into chunks using LangChain's text splitter
    splitter = CharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    chunks = splitter.split_text(text)

    # Generate embeddings for the text chunks
    embeddings = embedding_model.embed_documents(chunks)

    # Inform the user that embeddings are generated
    embedding_status_message = "Embeddings have been generated for the PDF."

    # Add embeddings to Qdrant
    vector_store.add_texts(chunks)

    # Inform the user that embeddings are stored in the vector database
    db_status_message = "Embeddings have been stored in the vector database."

    return {"message": f"PDF '{file.filename}' processed successfully. {embedding_status_message} {db_status_message}"}


@app.post("/query/")
async def query_pdf(query: str = Form(...)):
    try:
        # Debugging: Print the incoming query
        print(f"Received query: {query}")

        # Embed the query using the HuggingFace model
        query_embedding = embedding_model.embed_query(query)
        print(f"Query embedding: {query_embedding[:5]}")  # Print the first 5 dimensions of the embedding for debugging

        # Perform similarity search in Qdrant
        retriever = vector_store.as_retriever(search_type="mmr", search_kwargs={"k": 3})
        results = retriever.get_relevant_documents(query)
        print(f"Retrieved results: {results}")

        # Extract the top 3 chunks
        if not results:
            raise ValueError("No results found in vector store.")
        
        top_chunks = [result.page_content for result in results]
        print(f"Top chunks: {top_chunks}")

        # Concatenate chunks for LLM input
        context = "\n".join(top_chunks)
        print(f"Generated context: {context}")

        # Generate response using Cohere LLM
        response = llm.invoke(prompt_template.format(context=context, question=query))
        response_content = response.content if hasattr(response, "content") else str(response)
        # Return the response
        return JSONResponse(content={"answer": response_content})
    except Exception as e:
        # Log the traceback for detailed debugging
        error_details = traceback.format_exc()
        print(f"Error: {e}\nDetails:\n{error_details}")
        return JSONResponse(content={"error": str(e)}, status_code=500)