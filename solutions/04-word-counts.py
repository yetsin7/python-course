"""Count exact word occurrences without normalizing or modifying input."""


def count_words(words: list[str]) -> dict[str, int]:
    """Count exact word occurrences without normalizing or modifying input."""
    counts_by_word = {}
    for word in words:
        counts_by_word[word] = counts_by_word.get(word, 0) + 1
    return counts_by_word
