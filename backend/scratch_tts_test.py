import asyncio
import edge_tts

async def amain():
    communicate = edge_tts.Communicate("Hello from Jigyasa AI", "en-US-BrianNeural")
    await communicate.save("test_tts.mp3")
    print("Success: test_tts.mp3 created")

if __name__ == "__main__":
    asyncio.run(amain())
