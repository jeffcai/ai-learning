from pathlib import Path
import torch
from torch.utils.data import Dataset, DataLoader
import tiktoken

class GPTDatasetV1(Dataset):

    def __init__(self, txt, tokenizer, max_length, stride):
        self.input_ids = []
        self.target_ids = []
        token_ids = tokenizer.encode(txt)

        for i in range(0, len(token_ids) - max_length, stride):
            input_chunk = token_ids[i:i + max_length]
            target_chunk = token_ids[i + 1: i + max_length + 1]
            self.input_ids.append(torch.tensor(input_chunk))
            self.target_ids.append(torch.tensor(target_chunk))

    def __len__(self):
        return len(self.input_ids)

    def __getitem__(self, idx):
        return self.input_ids[idx], self.target_ids[idx]

# drop_last=True - drops the last batch if it is shorter than the specified batch_size to prevent loss spikes during training.
# num_workers - The number of CPU processes to use for preprocessing
def create_dataloader_v1(txt, batch_size=4, max_length=256,
    stride=128, shuffle=True, drop_last=True,
    num_workers=0):
    tokenizer = tiktoken.get_encoding("gpt2")
    dataset = GPTDatasetV1(txt, tokenizer, max_length, stride)
    dataloader = DataLoader(
    dataset,
    batch_size=batch_size,
    shuffle=shuffle,
    drop_last=drop_last,
    num_workers=num_workers)
    return dataloader

data_path = Path(__file__).resolve().parent / "the-verdict.txt"
with data_path.open("r", encoding="utf-8") as f:
    raw_text = f.read()
    
dataloader = create_dataloader_v1(raw_text, batch_size=1, max_length=4, stride=1, shuffle=False)

# Converts dataloader into a Python iterator to fetch the next entry via Python’s built-in next() function
data_iter = iter(dataloader)
first_batch = next(data_iter)
print(first_batch)

max_length = 4
dataloader = create_dataloader_v1(
    raw_text, batch_size=8, max_length=max_length,
    stride=max_length, shuffle=False
)
data_iter = iter(dataloader)
inputs, targets = next(data_iter)
print("Token IDs:\n", inputs)
print("\nInputs shape:\n", inputs.shape)

# Example of token and positional embeddings through nn.Embedding layer in PyTorch for a GPT model implementation
# what's nn.Embedding? basic idea is to map discrete tokens (like words or subwords) into continuous vector spaces. 
# Each token gets its own vector representation, which the model learns during training. 
# This helps the model understand relationships between different tokens based on their contexts in the training data.

# While token embeddings provide consistent vector representations for each
# token, they lack a sense of the token’s position in a sequence. To rectify this,
# two main types of positional embeddings exist: absolute and relative. OpenAI’s
# GPT models utilize absolute positional embeddings, which are added to the token
# embedding vectors and are optimized during the model training.

vocab_size = 50257
output_dim = 256
token_embedding_layer = torch.nn.Embedding(vocab_size, output_dim)
token_embeddings = token_embedding_layer(inputs)
print(token_embeddings.shape)

context_length = max_length
pos_embedding_layer = torch.nn.Embedding(context_length, output_dim)
pos_embeddings = pos_embedding_layer(torch.arange(context_length))
print(pos_embeddings.shape)

input_embeddings = token_embeddings + pos_embeddings
print(input_embeddings.shape)