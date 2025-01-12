from pygments.formatters import HtmlFormatter

css = HtmlFormatter(style='default').get_style_defs('.codehilite')
with open('static/pygments.css', 'w') as f:
    f.write(css)
