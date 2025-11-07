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
# how to compute attention scores for a single query? it's simply the dot product between the query vector and each of the input vectors
query = inputs[1] # journey embedding
attn_scores_2 = torch.empty(inputs.shape[0])
for i, x_i in enumerate(inputs):
    attn_scores_2[i] = torch.dot(x_i, query)
print(attn_scores_2)

# normalize the scores to get the attention weights
attn_weights_2_tmp = attn_scores_2 / attn_scores_2.sum()
print("Attention weights:", attn_weights_2_tmp)
print("Sum:", attn_weights_2_tmp.sum())

# more stable softmax implementation, In practice, it’s more common and advisable to use the softmax function for normalization. 
# This approach is better at managing extreme values and offers more favorable gradient properties during training. 
# In addition, the softmax function ensures that the attention weights are always positive. 
# This makes the output interpretable as probabilities or relative importance, where higher weights indicate greater importance.
def softmax_naive(x):
    return torch.exp(x) / torch.exp(x).sum(dim=0)

attn_weights_2_naive = softmax_naive(attn_scores_2)
print("Attention weights:", attn_weights_2_naive)
print("Sum:", attn_weights_2_naive.sum())

# Note that this naive softmax implementation (softmax_naive) may encounter
# numerical instability problems, such as overflow and underflow, when dealing with
# large or small input values. Therefore, in practice, it’s advisable to use the PyTorch
# implementation of softmax, which has been extensively optimized for performance
attn_weights_2 = torch.softmax(attn_scores_2, dim=0)
print("Attention weights:", attn_weights_2)
print("Sum:", attn_weights_2.sum())

# How to calculate the context vector? it's to calculate the context vector as the weighted sum of the input vectors.
# The context vector is a weighted sum of the input vectors, where the weights are given by the attention weights. 
# This allows the model to focus on the most relevant parts of the input when making predictions.
# The context vector captures the relevant information from the entire input sequence,
# weighted by their importance to the current query token.
query = inputs[1]
context_vec_2 = torch.zeros(query.shape)
for i,x_i in enumerate(inputs):
    context_vec_2 += attn_weights_2[i]*x_i
print(context_vec_2)

# attention scores for all queries
attn_scores = torch.empty(6, 6)
for i, x_i in enumerate(inputs):
    for j, x_j in enumerate(inputs):
        attn_scores[i, j] = torch.dot(x_i, x_j)
print(attn_scores)

# for loops are generally slow, and we can achieve the same results using matrix multiplication
attn_scores = inputs @ inputs.T
print(attn_scores)

# normalize the scores to get the attention weights
attn_weights = torch.softmax(attn_scores, dim=-1)
print(attn_weights)

# verify that each row sums to 1
row_2_sum = sum([0.1385, 0.2379, 0.2333, 0.1240, 0.1082, 0.1581])
print("Row 2 sum:", row_2_sum)
print("All row sums:", attn_weights.sum(dim=-1))

# calculate the context vectors as the weighted sum of the input vectors
all_context_vecs = attn_weights @ inputs
print(all_context_vecs)

print("Previous 2nd context vector:", context_vec_2)

# how computing the attention weights step by step implementing trainable weights?
d_k = inputs.shape[1]  # dimension of the input vectors
W_q = torch.nn.Parameter(torch.randn(d_k, d_k))  # query weight matrix
W_k = torch.nn.Parameter(torch.randn(d_k, d_k))  # key weight matrix
W_v = torch.nn.Parameter(torch.randn(d_k, d_k))  # value weight matrix

def compute_attention_weights(inputs):
    """Compute attention weights for all queries in inputs"""
    queries = inputs @ W_q
    keys = inputs @ W_k
    values = inputs @ W_v

    attn_scores = queries @ keys.T / (d_k ** 0.5)
    attn_weights = torch.softmax(attn_scores, dim=-1)
    return attn_weights, values
