# PDF Uploader Chatbot

A simple chatbot built to process PDF documents and answer queries based on the content of the uploaded PDFs. The bot uses natural language processing techniques to embed and search through the PDF content and return relevant information in response to user queries.

## Features

- **PDF Upload**: Allows users to upload PDF files for processing.
- **PDF Content Querying**: Once the PDF is uploaded, users can interact with the chatbot and query the PDF content.
- **Embeddings & Similarity Search**: The chatbot uses embeddings for the content of the PDF and performs similarity-based search to find the most relevant answers.
- **Cohere LLM Integration**: Uses Cohere's language model to generate responses based on the context retrieved from the PDF.

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Python (FastAPI)
- **PDF Processing**: PDF parsing and text extraction
- **Embeddings & Similarity Search**: Hugging Face, Qdrant, Langchain
- **LLM**: Cohere for natural language generation

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/MuhammadMillwala/pdf-query-bot.git

2.	Navigate to the project directory:

		cd pdf-chatbot


3.	Set up a virtual environment (optional but recommended):

		python3 -m venv venv
		source venv/bin/activate  # For macOS/Linux
		venv\Scripts\activate     # For Windows


4.	Install the required dependencies:

		pip install -r requirements.txt


5.	Run the backend server:
	
		uvicorn main:app --reload


6.	Open your browser and visit http://127.0.0.1:8000 to interact with the chatbot.


Usage
	1.	Upload a PDF: Select a PDF file to upload using the “Upload PDF” button.
	2.	Ask a Question: Once the PDF is uploaded, you can type a query in the text input box and press “Send”. The bot will process the query and return a relevant response from 		the PDF content.
	3.	Bot Responses: The chatbot will display the answers on the left side and your messages will appear on the right.


Customization
	•	You can modify the query_pdf function to adjust how the chatbot handles the PDF content, performs searches, and generates responses.
	•	The frontend can be customized to change the layout, styling, or interactions based on your needs.

Contributing

If you’d like to contribute to this project, feel free to fork the repository and submit a pull request. Please ensure that your changes do not break existing functionality, and provide clear documentation for new features.

License

This project is open-source and available under the MIT License.

Acknowledgements

	•	Cohere: Used for natural language processing and generating responses.
	•	Qdrant: Used for similarity search on the PDF content.
	•	Langchain: For handling language models and embeddings.
