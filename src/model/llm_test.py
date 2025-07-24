import llm

# Get the model
model = llm.get_model("q3")

# Test the model
response = model.prompt("hi")
print(response.text())