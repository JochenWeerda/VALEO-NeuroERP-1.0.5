import os, asyncio
from rag import RAGWorkflow

async def main():
    os.environ["LINKUP_API_KEY"] = "aca0b877-88dd-4423-a35b-97de39012db9"
    rag = RAGWorkflow()
    await rag.ingest_documents("data")
    result = await rag.query("Was ist der empfohlene Ansatz für die Transaktionsverarbeitung?")
    print(result)

if __name__ == "__main__":
    asyncio.run(main())
