# what's large language model token? 
# A token is a chunk of text that the model processes. It can be a word, part of a word, or a character.
# Models don't read text directly; they read a sequence of numbers (Token IDs).

# what's token id?
# A unique integer assigned to each token in the model's vocabulary.

# what's embedding?
# A vector (list of floating-point numbers) that represents the semantic meaning of a token.
# Tokens with similar meanings will have embeddings that are "close" to each other in vector space.

# what's Word2Vec?
# A popular algorithm (by Google, 2013) to create word embeddings.
# Core Idea: "You shall know a word by the company it keeps."
# If two words appear in similar contexts (e.g., "The [cat] sat" and "The [dog] sat"), they are semantically similar.
#
# How it works (Simplified):
# It trains a shallow neural network on a large corpus of text to do one of two tasks:
# 1. CBOW (Continuous Bag of Words): Predict the missing word based on surrounding context words.
#    - Input: "The", "cat", "on", "the", "mat" -> Target: "sat"
# 2. Skip-gram: Predict the surrounding context words based on a single target word.
#    - Input: "sat" -> Target: "The", "cat", "on", "the", "mat"
#
# The "weights" of this trained network become the word embeddings.
# Famous Result: Vector arithmetic works! (King - Man + Woman ≈ Queen).

# how to tokenize text and understand tokens?
# Tokenization is the process of converting raw text into a sequence of tokens.

# there are multiple methods of tokenization:
# 1. Word Tokenization: Splits text by spaces/punctuation. Simple, but leads to huge vocabularies (millions of words).
# 2. Character Tokenization: Splits text into characters. Small vocabulary, but sequences become very long and lose semantic meaning.
# 3. Subword Tokenization (BPE, WordPiece): The standard for LLMs. Balances vocabulary size and sequence length.
#    - Common words (e.g., "the", "apple") are single tokens.
#    - Rare words or complex terms are split into multiple subword tokens.

import tiktoken

def demonstrate_tokenization_types():
    text = "Tokenization is fun!"
    print(f"\n--- Comparing Tokenization Methods for: '{text}' ---")
    
    # 1. Word Tokenization (Naive)
    words = text.split()
    print(f"1. Word Tokenization: {words}")
    
    # 2. Character Tokenization
    chars = list(text)
    print(f"2. Character Tokenization: {chars}")
    
    # 3. Subword Tokenization (BPE - used by LLMs)
    encoding = tiktoken.get_encoding("cl100k_base")
    token_ids = encoding.encode(text)
    subwords = [encoding.decode_single_token_bytes(tid).decode('utf-8') for tid in token_ids]
    print(f"3. Subword Tokenization (BPE): {subwords}")

def demonstrate_tokens():
    demonstrate_tokenization_types()

    # 1. Choose an encoding (vocabulary) used by a model, e.g., GPT-4 (cl100k_base)
    encoding = tiktoken.get_encoding("cl100k_base")
    
    # Example 1: Simple sentence
    text = "Large Language Models are amazing!"
    analyze_text(encoding, text)

    # Example 2: Complex word and Emoji (shows sub-word tokenization)
    text_complex = "antidisestablishmentarianism 🤖"
    analyze_text(encoding, text_complex)

def analyze_text(encoding, text):
    print(f"\nAnalyzing: '{text}'")
    
    # 2. Encode: Text -> Token IDs
    token_ids = encoding.encode(text)
    
    print(f"Token IDs: {token_ids}")
    print(f"Number of tokens: {len(token_ids)}")
    
    # 3. Decode: Token IDs -> Text (to see what each token represents)
    print("--- Token Breakdown ---")
    for t_id in token_ids:
        token_bytes = encoding.decode_single_token_bytes(t_id)
        token_str = token_bytes.decode('utf-8', errors='replace')
        print(f"ID: {t_id:<6} | Token: '{token_str}'")

if __name__ == "__main__":
    demonstrate_tokens()
