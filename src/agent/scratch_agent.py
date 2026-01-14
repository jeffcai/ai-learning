import re

class Agent:
    def __init__(self, system_prompt, tools, model_callable):
        """
        Initialize the Agent.
        
        :param system_prompt: The instructions for the agent (persona, tool definitions).
        :param tools: A dictionary of tool names to functions.
        :param model_callable: A function that takes a string prompt and returns a string response.
        """
        self.system_prompt = system_prompt
        self.tools = tools
        self.model_callable = model_callable
        self.messages = []

    def run(self, user_query):
        """
        The main orchestration loop (The "Brain").
        """
        # Reset or initialize conversation
        self.messages = [{"role": "system", "content": self.system_prompt}]
        self.messages.append({"role": "user", "content": user_query})
        
        print(f"User: {user_query}")

        max_steps = 5
        step = 0

        while step < max_steps:
            step += 1
            
            # 1. Construct the prompt for the model
            prompt = self._format_prompt()
            
            # 2. Call the model (The "Model")
            # In a real app, this calls OpenAI/Anthropic/Local LLM
            response = self.model_callable(prompt)
            print(f"\n--- Step {step} ---\nModel Output:\n{response}")
            
            # 3. Parse the response to see if it wants to use a tool
            action, action_input = self._parse_response(response)
            
            if action == "Final Answer":
                return action_input
            
            if action:
                # 4. Execute Tool (The "Tool")
                print(f"\n[System: Executing Tool '{action}' with input '{action_input}']")
                tool_result = self._execute_tool(action, action_input)
                print(f"[System: Tool Output: {tool_result}]")
                
                # 5. Update History (Orchestration: Feeding back to model)
                # We append the model's thought/action and the tool's output
                self.messages.append({"role": "assistant", "content": response})
                self.messages.append({"role": "user", "content": f"Observation: {tool_result}"})
            else:
                # If no action parsed, assume it's the final answer or just chat
                return response
        
        return "Error: Maximum steps reached."

    def _format_prompt(self):
        """
        Simple prompt construction. 
        Concatenates messages into a single string for completion-style models.
        """
        formatted = ""
        for msg in self.messages:
            role = msg["role"].upper()
            content = msg["content"]
            formatted += f"{role}:\n{content}\n\n"
        formatted += "ASSISTANT:"
        return formatted

    def _parse_response(self, text):
        """
        Parses the model's output to find ReAct patterns.
        Expected format:
        Thought: ...
        Action: tool_name
        Action Input: args
        """
        # Look for "Final Answer:" first
        if "Final Answer:" in text:
             return "Final Answer", text.split("Final Answer:")[-1].strip()

        # Regex to find Action and Action Input
        action_match = re.search(r"Action:\s*(.*)", text)
        input_match = re.search(r"Action Input:\s*(.*)", text)
        
        if action_match and input_match:
            return action_match.group(1).strip(), input_match.group(1).strip()
        
        return None, None

    def _execute_tool(self, tool_name, tool_input):
        if tool_name in self.tools:
            try:
                return self.tools[tool_name](tool_input)
            except Exception as e:
                return f"Error executing tool: {e}"
        return f"Error: Tool {tool_name} not found."

# --- Example Usage ---

# 1. Define Tools
def calculator(expression):
    """Evaluates a mathematical expression."""
    try:
        # Warning: eval is unsafe for production, used here for simplicity
        return str(eval(expression))
    except Exception as e:
        return str(e)

def get_weather(location):
    """Mock weather tool."""
    if "tokyo" in location.lower():
        return "Sunny, 25°C"
    elif "london" in location.lower():
        return "Rainy, 15°C"
    return "Unknown location"

tools = {
    "calculator": calculator,
    "get_weather": get_weather
}

# 2. Define System Prompt (The "Protocol")
PROMPT_TEMPLATE = """
You are a helpful assistant. You have access to the following tools:

- calculator: Evaluates a mathematical expression.
- get_weather: Gets the weather for a location.

To use a tool, please use the following format:

Thought: Do I need to use a tool? Yes
Action: [tool_name]
Action Input: [input]

If you have the answer, use:

Final Answer: [your answer]
"""

# 3. Define Model (Mocked for this demo)
def mock_llm(prompt):
    """
    Simulates an LLM's response logic for specific queries.
    In a real application, this would be:
    return openai.Completion.create(prompt=prompt, ...).choices[0].text
    """
    last_user_message = ""
    # Find the last message from user/observation to decide what to do
    lines = prompt.strip().split('\n')
    
    # Very simple heuristic simulation
    if "Observation: Sunny, 25°C" in prompt:
        return """Thought: I have the weather data. I can answer the user now.
Final Answer: The weather in Tokyo is Sunny, 25°C."""
    
    if "weather in Tokyo" in prompt:
        return """Thought: The user wants to know the weather. I should use the get_weather tool.
Action: get_weather
Action Input: Tokyo"""
        
    return "Final Answer: I am a mock agent and I don't know how to handle this specific query."

if __name__ == "__main__":
    print("Initializing Agent...")
    agent = Agent(PROMPT_TEMPLATE, tools, mock_llm)
    
    print("\n--- Starting Run ---")
    result = agent.run("What is the weather in Tokyo?")
    print(f"\nFinal Result: {result}")
