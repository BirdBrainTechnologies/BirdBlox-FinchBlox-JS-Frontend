# This script creates the all.js file by concatenating all the js files mentioned in HummingbirdDragAndDrop2.html
# into one file, in order.  They also remove all occurrences of "use strict"; from the middle of the file,
# including that line only once, at the top of the file.  They turn off mouse mode by replacing "DO.mouse = true;" with
# "DO.mouse = false;".  All these modifications are performed with simple string.replace functions, so be careful not
# to use these strings anywhere the script does not expect them to appear.
# This script now also creates the alliOS9.js file needed to run on iOS9.

import re
import os
import subprocess

my_path = os.path.dirname(os.path.realpath(__file__))
path_prefix = my_path + "/"

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
    all_path = path_prefix + "all_MAX.js"
    if os.path.exists(all_path):
        os.remove(all_path)
    target = open(all_path, 'w')
    use_strict = "\"use strict\";"
    target.write(use_strict)
    target.write("\n")
    for path in paths:
        target.write(clean_file(open(path, "r").read()))
        target.write("\n")
    alliOS9_path = path_prefix + "alliOS9.js"
    if os.path.exists(alliOS9_path):
        os.remove(alliOS9_path)
    targetiOS9 = open(alliOS9_path, 'w')
    for path in paths:
        targetiOS9.write(clean_file_iOS9(open(path, "r").read()))
        targetiOS9.write("\n")
        
def clean_file(file):
    use_strict = "\"use strict\";"
    file = file.replace(use_strict, "")
    file = file.replace("DO.mouse = true;", "DO.mouse = false;")
    return file

def clean_file_iOS9(file):
    file = clean_file(file)
    file = file.replace("let ", "var ")
    file = file.replace("bvar", "blet")
    file = file.replace("const ", "var ")
    return file

concat_js()


# Minify using closure-compiler. Change the jar file name to the version you have downloaded.
# See https://developers.google.com/closure/compiler/docs/gettingstarted_app
cmd_str = "java -jar closure-compiler-v20230411.jar  --js all_MAX.js --js_output_file all.js"
subprocess.run(cmd_str, shell=True)