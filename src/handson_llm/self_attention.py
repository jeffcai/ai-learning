import torch.nn as nn
import torch

class SelfAttention_v1(nn.Module):
    def __init__(self, d_in, d_out):
        super().__init__()
        self.W_query = nn.Parameter(torch.rand(d_in, d_out))
        self.W_key = nn.Parameter(torch.rand(d_in, d_out))
        self.W_value = nn.Parameter(torch.rand(d_in, d_out))
    
    def forward(self, x):
        # print query, key, value matrices
        print("Queries:", x @ self.W_query)
        print("Keys:", x @ self.W_key)
        print("Values:", x @ self.W_value)
        
        keys = x @ self.W_key
        queries = x @ self.W_query
        values = x @ self.W_value
        attn_scores = queries @ keys.T
        attn_weights = torch.softmax(
        attn_scores / keys.shape[-1]**0.5, dim=-1
        )
        context_vec = attn_weights @ values
        return context_vec
    
# the inputs is embeddings vector for the sentence "Your journey starts with one step"
inputs = torch.tensor(
[   [0.43, 0.15, 0.89], # Your 
    [0.55, 0.87, 0.66], # journey 
    [0.57, 0.85, 0.64], # starts 
    [0.22, 0.58, 0.33], # with 
    [0.77, 0.25, 0.10], # one 
    [0.05, 0.80, 0.55]] # step 
)   

# define model and print output, d_in is embedding dimension, d_out is attention dimension
d_in = inputs.shape[1]
d_out = 2

# why 3 dimensions to 2 dimensions for context vector? it's arbitrary, just to show the transformation
torch.manual_seed(123)
sa_v1 = SelfAttention_v1(d_in, d_out)
print(sa_v1(inputs))

class SelfAttention_v2(nn.Module):
    def __init__(self, d_in, d_out, qkv_bias=False):
        super().__init__()
        self.W_query = nn.Linear(d_in, d_out, bias=qkv_bias)
        self.W_key = nn.Linear(d_in, d_out, bias=qkv_bias)
        self.W_value = nn.Linear(d_in, d_out, bias=qkv_bias)
    
    def forward(self, x):        
        keys = self.W_key(x)
        queries = self.W_query(x)
        values = self.W_value(x)
        attn_scores = queries @ keys.T
        attn_weights = torch.softmax(
        attn_scores / keys.shape[-1]**0.5, dim=-1
        )
        context_vec = attn_weights @ values
        return context_vec
    
torch.manual_seed(789)
sa_v2 = SelfAttention_v2(d_in, d_out)
print(sa_v2(inputs))