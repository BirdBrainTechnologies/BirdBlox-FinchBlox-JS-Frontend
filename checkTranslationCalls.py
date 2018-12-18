# This script checks all the calls to Language.getStr(). For each call found
# in the JavaScript files, it takes the string key argument and makes sure it
# exists in the English language dictionary. All other languages must be
# checked against English. Will only check calls with a string key argument
# (as apposed to calls using a variable).

import re
import os

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

def removeComments(string):
    # remove all occurance streamed comments (/*COMMENT */) from string
    string = re.sub(re.compile("/\*.*?\*/",re.DOTALL ) ,"" ,string)
    # remove all occurance singleline comments (//COMMENT\n ) from string
    string = re.sub(re.compile("//.*?\n" ) ,"" ,string) 
    return string

def concat_js():
    english = open(path_prefix + "Language/Language.en.js", "r").read()
    
    lines = get_lines_from_html(path_prefix + "HummingbirdDragAndDrop2.html")
    paths = get_paths_from_lines(lines)
    
    for path in paths:
        file = open(path, "r").read()
        file = removeComments(file)
        #calls = [m.start() for m in re.finditer('Language.getStr', file)]
        calls = re.findall(r'Language.getStr\(\"(.+?)\"\)', file)
        #print path
        #print calls
        for call in calls:
            entries = re.findall("\"" + call + "\":", english)
            if len(entries) != 1:
                print "Not found: " + call
            
           


        


concat_js()
