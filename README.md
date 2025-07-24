# AI Learning

All about AI Learning for self upskill, covering Agent, RAG and Fine Tuning relevant to AI/LLM, and also try to build something through learning.

## Run the demo

make sure python and required libraries installed

create and edit the .env as below at the root of the project, for configuring API keys:

```
# Alibaba Cloud DashScope API Key
# Get your API key from: https://help.aliyun.com/zh/model-studio/developer-reference/get-api-key
DASHSCOPE_API_KEY=your-api-key-here

# OpenAI API Key (if needed)
OPENAI_API_KEY=your-openai-api-key-here

# Hugging Face API Key (if needed)
HUGGINGFACE_API_KEY=your-hf-api-key-here
```

```
export HF_TOKEN=xxx (it's legacy, will remove it latter, to use the key in .env above)
python3 -m venv venv
source venv/bin/activate
pip3 install -r requirements.txt
```

### Troubleshooting

To bypass the firewall, you may need to run script as shown below (depends you use which type of proxy for https/http proxy):

```
export https_proxy=http://127.0.0.1:7890 http_proxy=http://127.0.0.1:7890 all_proxy=socks5://127.0.0.1:7890
```

Due to limit credits, may having error below when ruuning HuggingFace 
> You have exceeded your monthly included credits for Inference Providers. Subscribe to PRO to get 20x more monthly included credits.


To run local model, refer to two blogs coming from Simon Willison for installing llm, llm-mlx and downloading/running:
- [Run LLMs on macOS using llm-mlx and Apple’s MLX framework](https://simonwillison.net/2025/Feb/15/llm-mlx/)
- [Qwen3-8B](https://simonwillison.net/2025/May/2/qwen3-8b/)

```
pip3 install llm
llm install llm-mlx
llm mlx download-model mlx-community/Qwen3-8B-4bit
llm aliases set q3 mlx-community/Qwen3-8B-4bit
llm models options set q3 unlimited 1
```

for locating model, please refer to Simon's description below:

> This pulls 4.3GB of data and saves it to ~/.cache/huggingface/hub/models--mlx-community--Qwen3-8B-4bit.


## Agent - Architecture and Implementations

### Overview

### Agent - Orchestration

### Agent - Tools

### Agent - Model 


## RAG and Fine Tuning



## References

### Books

- [Build a large language model from scratch](https://www.manning.com/books/build-a-large-language-model-from-scratch)
- [Generative Model](https://book.douban.com/subject/37383541/)
- [LLM Inference in Production](https://bentoml.com/llm/)

### Courses

- [Hugging Face: Agents Course](https://huggingface.co/learn/agents-course/unit1/introduction)
- [从零开始的大语言模型原理与实践教程](datawhalechina.github.io/happy-llm/)

### Articles

- [【LLM 新手入門】2025 年如何自學 LLM](https://axk51013.medium.com/llm-%E6%96%B0%E6%89%8B%E5%85%A5%E9%96%80-2025-%E5%B9%B4%E5%A6%82%E4%BD%95%E8%87%AA%E5%AD%B8-llm-a0de380d78eb)
- [Agents: Authors: Julia Wiesinger, Patrick Marlow and Vladimir Vuskovic](https://drive.google.com/file/d/1oEjiRCTbd54aSdB_eEe3UShxLBWK9xkt/view?pli=1) - Google whitepater
- [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents) by Anthropic
- [How we built our multi-agent research system](https://www.anthropic.com/engineering/built-multi-agent-research-system) by Anthropic
- [A practical guide to building agents](https://cdn.openai.com/business-guides-and-resources/a-practical-guide-to-building-agents.pdf) by OpenAI
- [Writing an LLM from scratch](https://www.gilesthomas.com/llm-from-scratch) - personal blog series, relevant to the book above (build a large language model from scratch)

### Videos

- [Andrej Karpathy: Software Is Changing (Again)](https://www.youtube.com/watch?v=LCEmiRjPEtQ)
- [Andrej Karpathy: How I use LLMs](https://www.youtube.com/watch?v=EWvNQjAaOHw)

### Blogs

- https://simonwillison.net/

### Agents

- [Trae Agent is an LLM-based agent for general purpose software engineering tasks](https://github.com/bytedance/trae-agent)
