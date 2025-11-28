def to_camel(string: str) -> str:
    components = string.split('_')
    if not components:
        return string
    return components[0] + ''.join(word.capitalize() for word in components[1:])

