from importlib.metadata import version
import tiktoken

print("tiktoken version:", version("tiktoken"))

text = (
    "Hello, do you like tea? <|endoftext|> In the sunlit terraces"
    "of someunknownPlace."
)

tokenizer = tiktoken.get_encoding("gpt2")
integers = tokenizer.encode(text, allowed_special={"<|endoftext|>"})
print(integers)

strings = tokenizer.decode(integers)
print(strings)

# BPE always has a path because it works on subword units and falls back to individual bytes, so even unseen words get segmented. Advantage: no <UNK> token, better handling of morphologically rich or misspelled input, smoother generalization. Disadvantages: longer token sequences for rare words (higher latency/cost) and possible loss of meaningful boundaries, which can hurt downstream interpretability or alignment with linguistic units.

# BPE builds its vocabulary by iteratively merging frequent characters into sub-words and frequent subwords into words.

integers = tokenizer.encode("Akwirw ier")
print(integers)

strings = tokenizer.decode(integers)
print(strings)

