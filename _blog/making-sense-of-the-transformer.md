---
layout: default
title: "Making Sense of the Transformer"
date: 2026-01-27
categories:
  - machine-learning
  - transformers
  - nlp
  - llm
excerpt: "Trace every tensor, projection, and dot product, from RNNs' failure mode through embeddings, encoder-decoder stacks, and scaled dot-product attention, with shapes and pseudocode."
image: "/assets/blog/transformer/arch.png"
---

# Making Sense of the Transformer

<figure class="blog-figure">
  <img src="/assets/blog/transformer/arch.png" alt="The transformer model architecture in a nutshell" />
  <figcaption><strong>Figure 1.</strong> The transformer model architecture in a nutshell.</figcaption>
</figure>

## **TL;DR**

Transformers are the quiet engine behind modern AI, the architecture that turned attention into a scalable way for machines to read, write, see, and reason, powering models like GPT, BERT, Llama, ViT, and Stable Diffusion.

With that said, this post attempts to take the original Transformer from "*Attention Is All You Need*" and strip it down to the level where we can **trace every tensor, every projection, and every dot product** without hand waving. The aim is to close the gap between *understanding the diagram* and *being able to implement the model from scratch*.

We start from the failure mode of RNNs, move through embeddings and positional encodings, step into the encoder and decoder stacks, and then zoom all the way into the heart of the model: scaled dot product attention. Each concept is explained alongside shapes, pseudocode, and the exact data flow so you can see how a sentence becomes probabilities over a vocabulary.

By the end, you should be able to look at Q, K, V, masking, multi head attention, residual connections, and positional encodings and understand not just what they are, but **why they must exist** and how they fit together mechanically.

### Assuming a basic understanding of the below technical jargons:

- **Vectors:** Lists of numbers used to represent data (like words) mathematically. In this model, words are generally handled as vectors of size 512 so the system can perform operations like dot products on them.
- **Probability:** A score between 0 and 1 indicating the likelihood of a specific word being the correct translation. The model's final output is a distribution of probabilities over the entire vocabulary.
- **Encoder:** The "reader" half of the model. It is a stack of 6 layers that processes the input sequence to create a mathematical "memory" or understanding of it.
- **Decoder:** The "writer" half of the model. It is a stack of 6 layers that uses the Encoder's memory to generate the translated output sequence one word at a time.
- **Embeddings:** The first step that converts input words into vectors (lists of numbers) of size 512 $(d_{\text{model}})$, allowing the neural network to process them.
- **Positional Encodings:** Mathematical patterns (sine and cosine waves) added to embeddings to give the model a sense of word order, since the Transformer processes the entire sentence simultaneously rather than sequentially.
- **Softmax:** A function that turns raw numerical scores (logits) into probabilities (percentages summing to 1). It is used to calculate Attention weights and to select the final output word.
- **Feed-Forward Network (FFN):** A standard neural network layer applied independently to every single word position after the attention mechanism to further process the information.
- **Self-Attention (Intra Attention):** A mechanism allowing the model to look at other words in the *same* sentence to understand context (e.g., figuring out if "it" refers to "animal" or "street").
- **Multi-head Attention:** Running the attention mechanism 8 times in parallel. This allows the model to focus on different types of relationships (like grammar vs. vocabulary) at the same time ("representation subspaces").
- **Query (Q):** A vector representing the current word that is "searching" for relevant context from other words.
- **Key (Key):** A vector acting as a label for every word. The model compares the Query against the Key (via dot product) to calculate how relevant a word is.
- **Value (V):** A vector containing the actual information of a word. If a word is found relevant (high score between Query and Key), its Value is emphasized in the output.
- **Layer Normalization:** A mathematical step applied after each sub-layer to keep the numbers within a stable range, ensuring the model trains smoothly.
- **Auto Regressive:** The property of the Decoder where it generates words one by one, consuming the symbol it just generated as part of the input for the next step.
- **Label Smoothing:** A training technique where the model is taught to be slightly less confident (e.g., 90% instead of 100%) in its answers. This prevents the model from becoming "arrogant" (overfitting) and improves final accuracy scores.
- **Residual Connection:** A "shortcut" that adds the original input of a layer back to its output $(x + \text{sublayer}(x))$. This prevents information from being lost as it flows through the deep stack of layers.
- *W* are the associated weights.

---

## The problem Recurrent Neural Networks (RNNs) could not solve

RNNs read sentences like this:

```
word₁ →word₂ →word₃ → ... →wordₙ
```

One step at a time, memory is passed forward like a baton.

This creates 3 hard problems:

- The model cannot look at all words at once
- Information from early words fades as the chain grows longer
- Training cannot be parallelized across words

Long sentences break them. Training is slow. Context gets blurry.

We need a system where every word can look at every other word simultaneously. This is where attention comes into the picture.

## So what basically is attention trying to compute?

Take this sentence:

> "The animal didn't cross the street because it was tired"

The word **"it"** needs to figure out who it refers to. Not by memory or sequence but by comparing itself to every other word. This is the key idea:

> Every word asks: who in this sentence is relevant to me?

Mathematically, that question becomes a dot product.

<figure class="blog-figure">
  <img src="/assets/blog/transformer/relevance.png" alt="The opacity of the highlighted word represents relevance strength" />
  <figcaption><strong>Figure 2.</strong> The opacity of the highlighted word represents relevance strength.</figcaption>
</figure>

I have broken this down into three parts of pseudocode: the High-Level Flow, the Internal Layers (Encoder/Decoder), and the Attention Mechanism (the core "brain").

### 1. High-Level Transformer Architecture

This describes the overall movement of data from input sentence to output probability. The model relies on an Encoder to "read" and a Decoder to "write".

> The obvious question popped when I was reading the implementation, why specifically 6 layers of encoder/decoder?
>
> Well, tldr; the researchers treated the layers (N) as a hyperparameter for their experiment and 6 turned out to be the sweet spot w.r.t training, compute and performance optimization.
>
> For longer intuition, refer the multi-head part.

```python
class TransformerModel:
    def __init__(self):
        # Initialize sub-components
        self.encoder_stack = Stack of 6 EncoderLayers
        self.decoder_stack = Stack of 6 DecoderLayers
        self.src_embedding = Embeddings + PositionalEncoding
        self.tgt_embedding = Embeddings + PositionalEncoding
        self.generator = LinearLayer + Softmax

    def forward_pass(source_sentence, target_sentence):
        # Assuming:
        #   Batch Size (B) = 32
        #   Sequence Length (L) = 10 words
        #   Model Dimension (d_model) = 512

        # STEP 1: PREPARE INPUTS
        # Convert words to vectors (Embeddings) and add specific patterns
        # to those vectors so the model knows the order of words (PositionalEncoding).
        # Shape: [B, L] -> [B, L, 512]
        src_vectors = self.src_embedding(source_sentence)
        tgt_vectors = self.tgt_embedding(target_sentence)

        # STEP 2: ENCODE (Read the source)
        # Pass the source vectors through the stack of 6 encoders.
        # The output 'memory' contains the model's understanding of the input.
        # Pass through 6 layers. Shape remains constant: [B, L, 512]
        memory = self.encoder_stack(src_vectors)

        # STEP 3: DECODE (Generate the target)
        # The decoder looks at the target words generated so far (tgt_vectors)
        # and uses the 'memory' from the encoder to predict the next word.
        # Output shape: [B, L, 512]
        output_vectors = self.decoder_stack(tgt_vectors, memory)

        # STEP 4: GENERATE PROBABILITIES
        # Turn the complex vectors back into probabilities for each word in the vocabulary.
        # Map 512 dims to Vocabulary Size (e.g., 30,000 words)
        # Final Shape: [B, L, 30000]
        probabilities = self.generator(output_vectors)

        return probabilities
```

After embeddings, we have

$$
X_{\mathrm{shape}} = (\mathrm{seq_length}=8,\ d_{\mathrm{model}} = 512)
$$

Each word is now a 512-dimensional vector. But raw embeddings are not enough. We need three different *views* of each word. So we create three projections.

$$
\begin{aligned}
Q &= X W_Q \\\\
K &= X W_K \\\\
V &= X W_V
\end{aligned}
$$

- Query (Q): what I am looking for
- Key (K): what I contain
- Value (V): what I will contribute if chosen

All shapes remain $(8, 512)$.

We now compute,

$$
\text{scores} = Q K^T
$$

so the shapes after dot product become,

$$
(8,\ 512) \cdot (512,\ 8) = (8,8)
$$

Now we need to realise the importance of this matrix. Row $i$ and column $j$ tells how relevant word $j$ is to word $i$ using an angle in the projected vector space. This results in aligned vectors that can be grouped together by semantic relevance, for "it", the highest score will align with "animal".

### 2. The Layers: Encoder and Decoder

This section explains what happens inside the stacks. The key building blocks here are **Attention** (finding relationships) and **Feed-Forward Networks** (processing information), linked by **Residual Connections** (keeping the signal relevant and strong).

```python
class EncoderLayer:
    def process(input_vectors):
        # SUB-LAYER 1: SELF-ATTENTION
        # The model looks at every word in the input simultaneously to understand context.
        # e.g., connecting "bank" to "river" rather than "money".
        attention_output = MultiHeadAttention(input_vectors(Weight_Matrix_Q), input_vectors(Weight_Matrix_K), input_vectors(Weight_Matrix_V))

        # Add & Norm: Add the original input to the result (Residual) and normalize.
        # This prevents the model from forgetting the original words.
        mid_vectors = LayerNorm(input_vectors + attention_output)

        # SUB-LAYER 2: FEED-FORWARD NETWORK
        # A standard neural network processes each word vector individually.
        ff_output = FeedForward(mid_vectors)

        # Another Add & Norm step.
        final_vectors = LayerNorm(mid_vectors + ff_output)

        return final_vectors
```

**Masked Attention**

In the Encoder (the "reader"), the model is allowed to see the entire sentence at once to understand context (e.g., reading "The quick brown fox" simultaneously). However, the Decoder (the "writer") has a stricter rule: **Autoregression**.

When the model is trying to predict the 4th word, it should not be allowed to peek at the 5th word, even though during training (using a known dataset), we technically have the answer key. To prevent this cheating, we use a Look-Ahead Mask.

In our code, this looks like setting the attention scores of future words to negative infinity (`-inf`).

- **Before Softmax:** `[0.8, 0.9, -inf, -inf]`
- **After Softmax:** `[0.45, 0.55, 0.0, 0.0]`

This ensures the probability of attending to a future word is exactly zero.

### 3. The Core Mechanism: Scaled Dot-Product Attention

This is the mathematical heart of the paper (the "Attention" in the title). It calculates how much strength each word carries w.r.t, the input context.

<figure class="blog-figure">
  <img src="/assets/blog/transformer/attention.png" alt="Scaled dot-product attention mechanism (from Illustrated Transformer)" />
  <figcaption><strong>Figure 3.</strong> Scaled dot-product attention mechanism. <em>Ref: <a href="https://jalammar.github.io/illustrated-transformer/">Illustrated Transformer</a></em></figcaption>
</figure>

```python
def ScaledDotProductAttention(query, key, value, mask=None):
    # 1. MEASURE SIMILARITY
    # Calculate dot product (similarity) between the Query and all Keys.
    # If the dot product is high, the words are related.
    scores = dot_product(query, key)

    # 2. SCALE
    # Divide by the square root of the dimension (e.g., 8) to keep gradients stable.
    scores = scores / sqrt(d_k)

    # 3. MASK (Optional)
    # If we are in the decoder, hide future words by setting their score to -infinity.
    if mask is not None:
        scores = apply_mask(scores)

    # 4. NORMALIZE (Softmax)
    # Convert scores into probabilities (weights) that add up to 1.
    # e.g., Focus 80% on "animal" and 20% on "tired".
    weights = softmax(scores)

    # 5. AGGREGATE
    # Multiply the weights by the Values to get the final representation.
    # Irrelevant words (low weight) are drowned out; relevant words are amplified.
    output = dot_product(weights, value)

    return output
```

> Why multi-head attention mechanism uses 8 heads instead of 16 or 32?
>
> The use of 8 heads in multi-head attention (MHA) here was chosen primarily as an empirical balance between computational efficiency, model capacity, and training stability. While 16 or 32 heads can be used in larger models (e.g., BERT-Large or Llama 2), 8 heads provides an optimal, computationally efficient configuration for standard transformer sizes (usually with an embedding dimension of 512 or 768) as per the cited experiments in the paper.
>
> Furthermore, Studies on [head pruning](https://blog.ml.cmu.edu/2020/03/20/are-sixteen-heads-really-better-than-one/) suggest that beyond 8–16 heads, many heads become redundant or learn overlapping patterns for standard $d_{\text{model}}$ sizes.
>
> **Largely,** the primary constraint is that the total model dimension is divided among the heads: $d_k = d_{\text{model}} / h$
>
> - **Subspace Expressiveness:** Each head operates in its own low-rank subspace. If you increase heads (e.g., to 32) without increasing $d_{\text{model}}$, the individual head dimension $d_k$ becomes too small to capture complex semantic relationships. For the Transformer $d_{\text{model}} = 512$, 8 heads resulted in $d_k = 64$, which is considered a "sweet spot" for balancing specialized focus with enough representational capacity.
>
> - **Approximation Complexity:** Theoretical analysis shows that when $h$ is smaller than the intrinsic dimension $D$ of the target task, the parameter count required for a specific accuracy can grow exponentially with sequence length. Conversely, having "enough heads" $h \geq D$ allows the model to allocate one head per component feature, enabling efficient approximation.
>
> - **Computational Parity:** Mathematically, the total computational cost of 8 heads of size 64 is nearly identical to one head of size 512 (8×64=512). However, as $h$ increases, the overhead of managing many small matrix operations and memory bandwidth becomes a bottleneck on hardware.

```python
# Splitting the heads is where the magic happens
# d_model (512) is split into 8 heads of size 64 (d_k)

def split_heads(x):
    # Input x: [Batch, Length, 512]
    # Reshape to: [Batch, Length, 8, 64]
    # Transpose to: [Batch, 8, Length, 64]
    return x.view(batch, -1, 8, 64).transpose(1, 2)

# Why? This allows us to run 8 independent attention mechanisms
# in parallel (computational parity)
```

## The use of sine/cosine waves for positional encoding

The Transformer processes all words simultaneously (unlike RNNs, which process sequentially), therefore it has no inherent sense of order. It needs encodings to distinguish between `The dog bit the man` and `The man bit the dog`

Now, inorder to achieve that, the authors experimented with sinusoidal waves and learned positional embeddings. Although both the methods produced identical results in terms of accuracy, the final outcome was in favour of sine/cosine waves because of the following reasons:

### 1. Learning Relative Positions

sine and cosine waves make it easier for the model to learn **relative positions, i.e.,** the distance between two words.

For any fixed distance $(\text{offset } k)$ between two words, the encoding of a later position $\text{PE}_{\text{pos}+k}$ can be represented as a linear function of the earlier position $\text{PE}_{\text{pos}}$. This consistent mathematical relationship helps the model easily **attend** to words based on how far apart they are.

### 2. Handling Longer Sentences (Extrapolation)

This is a crucial practical advantage. The sinusoidal functions allow the model to extrapolate to sequence lengths longer than those encountered during training.

- **Learned Embeddings:** If the model simply memorized a specific vector for Position 1, Position 2, etc., it would fail if it suddenly encountered a sentence with 100 words when it was only trained on sentences with 50. It wouldn't have a **memory** for position 51.
- **Sine/Cosine:** Because these are continuous repeating waves, the pattern continues indefinitely. The model can generate a valid encoding for position 100 even if it has never seen a sentence that long before.

### Flow of tensors (a.k.a transformer) in a nutshell

```python
(batch, seq, 512)
→ project QKV
→ (batch, heads, seq, 64)
→ attention
→ concat
→ (batch, seq, 512)
→ FFN
→ repeat ×6
```

### Is it still relevant?

From 2017 to today, the architecture we just built is the original "Encoder-Decoder" Transformer. Today, most famous models utilize just one half of this stack, eg.,

- **BERT / RoBERTa (Encoder-Only):** Uses only the Encoder stack. Great for understanding tasks like classification or sentiment analysis.
- **GPT / Llama (Decoder-Only):** Uses only the Decoder stack. Great for generative tasks like writing code or stories.

However, the core mechanics of Self-Attention, Embeddings, and Softmax remain exactly the same as the code we wrote above.

---

## References

1. **Vaswani, A., Shazeer, N., Parmar, N., Uszkoreit, J., Jones, L., Gomez, A. N., Kaiser, Ł., & Polosukhin, I.** (2017). *Attention is all you need.* In Advances in Neural Information Processing Systems (NeurIPS). [arXiv:1706.03762](https://arxiv.org/abs/1706.03762)

2. **Alammar, J.** *The Illustrated Transformer.* [https://jalammar.github.io/illustrated-transformer/](https://jalammar.github.io/illustrated-transformer/)

3. **Michel, P., Levy, O., & Neubig, G.** (2020). *Are sixteen heads really better than one?* CMU Machine Learning Blog. [https://blog.ml.cmu.edu/2020/03/20/are-sixteen-heads-really-better-than-one/](https://blog.ml.cmu.edu/2020/03/20/are-sixteen-heads-really-better-than-one/)
