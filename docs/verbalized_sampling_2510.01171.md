# Verbalized Sampling (arXiv:2510.01171) - Adaptation Notes

Source captured with Firecrawl from the arXiv text/HTML version, not the PDF.

## Source

- Title: Verbalized Sampling: How to Mitigate Mode Collapse and Unlock LLM Diversity
- arXiv: 2510.01171
- Version: v3
- Submitted: 2025-10-01
- Last revised: 2025-10-10
- Authors: Jiayi Zhang, Simon Yu, Derek Chong, Anthony Sicilia, Michael R. Tomz, Christopher D. Manning, Weiyan Shi
- arXiv abstract page: https://arxiv.org/abs/2510.01171
- Text/HTML version: https://arxiv.org/html/2510.01171v3
- DOI: https://doi.org/10.48550/arXiv.2510.01171
- Associated code from arXiv page: https://github.com/CHATS-lab/verbalized-sampling
- Project page from article: https://www.verbalized-sampling.com/

## Core Idea

The paper argues that post-training alignment can reduce output diversity through mode collapse. A key claimed cause is typicality bias in preference data: annotators tend to prefer familiar, fluent, conventional text, so preference optimization sharpens the model toward typical completions when many valid answers have similar true utility.

Verbalized Sampling (VS) is a training-free inference prompt strategy. Instead of asking for one answer, it asks the model to produce a distribution of plausible answers and assign probabilities to each answer. The paper's intuition is that a direct instance-level prompt collapses to a typical single mode, while a distribution-level prompt elicits more of the model's latent pretraining distribution.

## Method Shape

Standard VS prompt shape:

```text
Generate {num_samples} responses to the input prompt.
Return the responses in JSON format with the key "responses" (list of dicts).
Each dictionary must include:
- text: the response string only
- probability: the estimated probability from 0.0 to 1.0 of this response given the input prompt, relative to the full distribution
Give ONLY the JSON object, with no explanations or extra text.
```

Output shape:

```json
{
  "responses": [
    {
      "text": "...",
      "probability": 0.34
    }
  ]
}
```

Variants discussed in the paper:

- Standard VS: one call, multiple candidates with probabilities.
- Probability-tuned VS: ask for samples from the full distribution or only from probability bands/tails, such as responses below a probability threshold.
- Multi-turn VS: generate a small batch per turn, then ask for alternatives in following turns.
- VS-CoT: generate candidates with an explicit reasoning field. This is not generally portable into Prompt Master because many supported target models are reasoning-native or explicitly forbid visible chain-of-thought prompts.

## Reported Results

The paper reports:

- Creative writing diversity improves by roughly 1.6-2.1x over direct prompting.
- Human evaluation scores in creative tasks improve by 25.7%.
- VS recovers a substantial portion of base-model diversity after alignment.
- The method is tested across creative writing, dialogue simulation, open-ended QA, synthetic data generation, commonsense/factual accuracy, and safety checks.
- More capable models appear to benefit more from VS.

## Relevant Evaluation Areas

- Creative writing: poems, jokes, stories.
- Dialogue simulation: more realistic diversity of human behavior.
- Open-ended QA: broader coverage for prompts with many valid answers.
- Synthetic data generation: more diverse generated training/evaluation instances.
- Safety and factuality: check that diversity does not weaken refusal behavior or factual accuracy.

## Adaptation Hooks For Prompt Master

Prompt Master currently optimizes toward one paste-ready prompt. VS suggests a controlled way to expose diversity without turning every request into an unfocused list.

Potential hooks:

- Add an optional "candidate set" pattern for prompt-generation tasks where one canonical prompt may overfit a single style.
- Generate 3 prompt variants with probability/fit labels for taste-based, creative, research, synthetic-data, and unknown-tool requests.
- Keep the default output as one final prompt, but use VS internally or as an optional user-facing mode when the request asks for alternatives.
- Add a "probability band" lever for divergent ideation: mainstream, balanced, or tail/novel variants.
- Use VS for prototype-first prompts in pattern #56, where taste cannot be drained by clarifying questions.
- Use VS for research/deck/image/video prompt alternatives where adjustable knobs materially change outcomes.
- Avoid VS by default for security-sensitive code agents, migrations, production changes, credentials, and destructive operations. Diversity is less valuable than determinism there.
- Do not import VS-CoT broadly. Prompt Master's no-CoT rules for reasoning-native models and Claude/GPT current-gen profiles still take precedence.

## Implementation Questions For This Repo

- Should VS be a new named pattern in `references/patterns.md`, or a fragment in `references/templates.md`?
- Should Prompt Master ever output multiple full prompts by default, or only when the user asks for variants?
- If multiple candidates are generated, should the output contract use `probability`, `fit`, or `risk`? For prompt engineering, "fit" and "risk" may be more honest than model-estimated probabilities.
- How should golden scenarios verify the behavior without making the skill verbose or violating the current "single copyable prompt block" lock?
- Should the README advertise this as "variant mode" or keep it as internal quality logic?

