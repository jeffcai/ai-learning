import os
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Check if API key is available
api_key = os.getenv("DASHSCOPE_API_KEY")
if not api_key:
    print("Error: DASHSCOPE_API_KEY not found in environment variables.")
    print("Please set your API key in the .env file or as an environment variable.")
    print("Get your API key from: https://help.aliyun.com/zh/model-studio/developer-reference/get-api-key")
    exit(1)

client = OpenAI(
    # 若没有配置环境变量，请用阿里云百炼API Key将下行替换为：api_key="sk-xxx",
    api_key=api_key,  # 如何获取API Key：https://help.aliyun.com/zh/model-studio/developer-reference/get-api-key
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1"
)

try:
    completion = client.chat.completions.create(
        model="deepseek-r1",  # 此处以 deepseek-r1 为例，可按需更换模型名称。
        messages=[
            {'role': 'user', 'content': '9.9和9.11谁大'}
        ]
    )

    # 通过reasoning_content字段打印思考过程
    print("思考过程：")
    print(completion.choices[0].message.reasoning_content)

    # 通过content字段打印最终答案
    print("最终答案：")
    print(completion.choices[0].message.content)

except Exception as e:
    print(f"Error calling DashScope API: {e}")
    print("Please check your API key and internet connection.")