from smolagents import CodeAgent, DuckDuckGoSearchTool, InferenceClientModel

agent = CodeAgent(
    tools=[DuckDuckGoSearchTool()],
    model=InferenceClientModel()
)

# CodeAgent can generate complex code:
result = agent.run("""
Search for Python tutorials and then:
1. Count how many results mention 'beginner'
2. Extract the top 3 most relevant URLs
3. Create a summary report
""")

# Agent might generate:
"""
search_tool = DuckDuckGoSearchTool()
results = search_tool.forward("Python tutorials")

beginner_count = 0
top_urls = []

for result in results:
    if 'beginner' in result.lower():
        beginner_count += 1
    if len(top_urls) < 3:
        top_urls.append(result['url'])

summary = f"Found {beginner_count} beginner tutorials. Top URLs: {top_urls}"
print(summary)
"""