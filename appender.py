import re
import os

my_path = os.path.dirname(os.path.realpath(__file__))
path_prefix = my_path + "\\"

def get_path_from_line(line):
    line = line.strip()
    if len(line) < 4 or line[0:7] != "<script":
        return ""
    line = line.replace("<script type=\"text/javascript\" src=\"", "")
    line = line.replace("\"></script>", "")
    return path_prefix + line

def get_paths_from_lines(lines):
    result = []
    for line in lines:
        res = get_path_from_line(line)
        if res != "":
            result.append(res)
    return result

def get_lines_from_html(html_path):
    html_file = open(html_path, "r")
    text = html_file.read()
    lines = re.split("\n", text)
    return lines

def concat_js():
    lines = get_lines_from_html(path_prefix + "HummingbirdDragAndDrop2.html")
    paths = get_paths_from_lines(lines)
    all_path = path_prefix + "all.js"
    if os.path.exists(all_path):
        os.remove(all_path)
    target = open(all_path, 'w')
    use_strict = "\"use strict\";"
    target.write(use_strict)
    target.write("\n")
    for path in paths:
        target.write(open(path, "r").read().replace(use_strict, ""))
        target.write("\n")
concat_js()