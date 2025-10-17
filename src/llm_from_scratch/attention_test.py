import torch

inputs = torch.tensor(
    [[0.43, 0.15, 0.89], # Your 
    [0.55, 0.87, 0.66], # journey 
    [0.57, 0.85, 0.64], # starts 
    [0.22, 0.58, 0.33], # with 
    [0.77, 0.25, 0.10], # one 
    [0.05, 0.80, 0.55]] # step
)

# the second input is the query token and we compute dot products with all tokens as the intermediate attention scores
query = inputs[1]
attn_scores_2 = torch.empty(inputs.shape[0])
for i, x_i in enumerate(inputs):
    attn_scores_2[i] = torch.dot(x_i, query)
print(attn_scores_2)

# normalize the scores to get the attention weights
attn_weights_2_tmp = attn_scores_2 / attn_scores_2.sum()
print("Attention weights:", attn_weights_2_tmp)
print("Sum:", attn_weights_2_tmp.sum())

# more stable softmax implementation
# In addition, the softmax function ensures that the attention weights are always positive. 
# This makes the output interpretable as probabilities or relative importance, where higher weights indicate greater importance.
def softmax_naive(x):
    return torch.exp(x) / torch.exp(x).sum(dim=0)

attn_weights_2_naive = softmax_naive(attn_scores_2)
print("Attention weights:", attn_weights_2_naive)
print("Sum:", attn_weights_2_naive.sum())

attn_weights_2 = torch.softmax(attn_scores_2, dim=0)
print("Attention weights:", attn_weights_2)
print("Sum:", attn_weights_2.sum())

# calculate the context vector as the weighted sum of the input vectors
# The context vector is a weighted sum of the input vectors, where the weights are given by the attention weights. 
# This allows the model to focus on the most relevant parts of the input when making predictions.
# The context vector captures the relevant information from the entire input sequence,
# weighted by their importance to the current query token.
query = inputs[1]
context_vec_2 = torch.zeros(query.shape)
for i,x_i in enumerate(inputs):
    context_vec_2 += attn_weights_2[i]*x_i
print(context_vec_2)
