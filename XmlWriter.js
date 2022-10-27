/**
 * Static class that helps parse and write XML files
 */
function XmlWriter() {

}

/**
 * Creates ax XML document with the the specified tag
 * @param {string} tagName - The root tag
 * @return {Document} - An XML document to write to
 */
XmlWriter.newDoc = function(tagName) {
  tagName = XmlWriter.escape(tagName);
  const xmlString = "<" + tagName + "></" + tagName + ">";
  const parser = new DOMParser();
  return parser.parseFromString(xmlString, "text/xml");
};

/**
 * Creates a tag in the XML document.  It doesn't have a parent yet.  appendChild is used to do that.
 * @param {Document} xmlDoc - The document to create the tag in
 * @param {string} tagName - The name of the tag to create
 * @return {Element} - The resulting element
 */
XmlWriter.createElement = function(xmlDoc, tagName) {
  tagName = XmlWriter.escape(tagName);
  return xmlDoc.createElement(tagName);
};

/**
 * Sets an attribute of an element to a value.  Automatically escapes the value before doing so.
 * @param {Element} element
 * @param {string} name - The name of the attribute
 * @param {string} value - The value to set
 */
XmlWriter.setAttribute = function(element, name, value) {
  name = XmlWriter.escape(name);
  value = XmlWriter.escape(value);
  element.setAttribute(name, value);
};

/**
 * Creates a text node that contains data and can be added as a child of another tag
 * @param {Document} xmlDoc - The document to create the nod in
 * @param {string} data - The text to store; will be escaped
 * @return {Text}
 */
XmlWriter.createTextNode = function(xmlDoc, data) {
  data = XmlWriter.escape(data);
  return xmlDoc.createTextNode(data);
};

/**
 * Escapes text to be stored in text nodes and attributes.  Some automatic escaping is applied by the browser, but
 * this is just to be safe.  You may notice that some of these characters end up double escaped in the file.
 * @param {string} string - The string to escape
 * @return {string}
 */
XmlWriter.escape = function(string) {
  string = string + "";
  string = string.replace(/&/g, '&amp;');
  string = string.replace(/</g, '&lt;');
  string = string.replace(/>/g, '&gt;');
  string = string.replace(/"/g, '&quot;');
  string = string.replace(/'/g, '&apos;');
  string = string.replace(/ /g, '&#32;');
  return string;
};

/**
 * Unescapes the text in the XML file
 * @param {string} string
 * @return {string}
 */
XmlWriter.unEscape = function(string) {
  string = string + "";
  string = string.replace(/&#32;/g, ' ');
  string = string.replace(/&apos;/g, "'");
  string = string.replace(/&quot;/g, '"');
  string = string.replace(/&gt;/g, '>');
  string = string.replace(/&lt;/g, '<');
  string = string.replace(/&amp;/g, '&');
  return string;
};

/**
 * Opens the contents of an XML file in a new window.  Used for debugging
 * @param {Document} xmlDoc - The document to open
 */
XmlWriter.downloadDoc = function(xmlDoc) {
  window.open('data:text/xml,' + HtmlServer.encodeHtml(XmlWriter.docToText(xmlDoc)));
};

/**
 * Creates a Document from an XML string
 * @param {string} xmlString
 * @return {Document}
 */
XmlWriter.openDoc = function(xmlString) {
  const parser = new DOMParser();
  return parser.parseFromString(xmlString, "text/xml");
};

/**
 * Finds a tag in the document with the specified name
 * @param {Document} xmlDoc - The document to search
 * @param {string} tagName - The name of the tag to search for
 * @return {null|Node} - The node or null if no tag has that name
 */
XmlWriter.findElement = function(xmlDoc, tagName) {
  tagName = XmlWriter.escape(tagName);
  const results = xmlDoc.getElementsByTagName(tagName);
  if (results.length === 0) {
    return null;
  }
  return results[0];
};

/**
 * Finds children of the provided node with the specified name.
 * @param {Node} node
 * @param {string} tagName - The tag to look for
 * @return {Array<Node>} - All children with a matching name
 */
XmlWriter.findSubElements = function(node, tagName) {
  if (node == null) {
    return [];
  }
  const children = node.childNodes;
  const results = [];
  for (let i = 0; i < children.length; i++) {
    if (children[i].nodeType === 1 && children[i].nodeName === tagName) {
      results.push(children[i]);
    }
  }
  return results;
};

/**
 * Finds any child of the provided tag with the specified name
 * @param {Node} node - The node to examine
 * @param {string} tagName - The name to find
 * @return {Node|null}
 */
XmlWriter.findSubElement = function(node, tagName) {
  if (node == null) {
    return null;
  }
  const children = node.childNodes;
  for (let i = 0; i < children.length; i++) {
    if (children[i].nodeType === 1 && children[i].nodeName === tagName) {
      return children[i];
    }
  }
  return null;
};

/**
 * Reads an attribute of a node
 * @param {Node} element
 * @param {string} name - The name of the attribute
 * @param {*} [defaultVal] - The value to return if the attribute isn't found
 * @param {boolean} [isNum=false] - Whether the result should be converted to a number
 * @return {*}
 */
XmlWriter.getAttribute = function(element, name, defaultVal, isNum) {
  if (isNum == null) {
    isNum = false;
  }
  if (defaultVal == null) {
    defaultVal = null;
  }
  let val = element.getAttribute(XmlWriter.escape(name));
  if (val == null) {
    return defaultVal;
  }
  val = XmlWriter.unEscape(val);
  if (isNum) {
    const numData = (new StringData(val)).asNum();
    if (numData.isValid) {
      return numData.getValue();
    }
    return defaultVal;
  }
  return val;
};

/**
 * Read a text node from a element
 * @param {Node} element
 * @param {string} name - The name of the text node
 * @param {string|null|number} [defaultVal=null] - The value to return if there is no text node
 * @param {boolean} isNum - Whether the result should be converted to a number
 * @return {string|null|number}
 */
XmlWriter.getTextNode = function(element, name, defaultVal, isNum) {
  if (isNum == null) {
    isNum = false;
  }
  if (defaultVal == null) {
    defaultVal = null;
  }
  const innerNode = XmlWriter.findSubElement(element, name);
  if (innerNode == null) {
    return defaultVal;
  }
  const childNodes = innerNode.childNodes;
  if (childNodes.length >= 1 && childNodes[0].nodeType === 3) {
    let val = childNodes[0].nodeValue;
    if (val == null) {
      return defaultVal;
    }
    val = XmlWriter.unEscape(val);
    if (isNum) {
      const numData = (new StringData(val)).asNum();
      if (numData.isValid) {
        return numData.getValue();
      }
      return defaultVal;
    }
    return val;
  } else if (childNodes.length === 0) {
    return "";
  }
  return defaultVal;
};

/**
 * Convert an XML document into text
 * @param {Document} xmlDoc
 * @return {string}
 */
XmlWriter.docToText = function(xmlDoc) {
  const serializer = new XMLSerializer();
  return serializer.serializeToString(xmlDoc);
};

/**
 * Finds a Node from a list of nodes that has an attribute "key" that matches the provided key.  Used for finding
 * Slot nodes with certain keys
 * @param {Array<Node>} nodes
 * @param {string} key
 * @return {null|Node}
 */
XmlWriter.findNodeByKey = function(nodes, key) {
  for (let i = 0; i < nodes.length; i++) {
    const nodeKey = XmlWriter.getAttribute(nodes[i], "key", "");
    if (nodeKey === key) {
      return nodes[i];
    }
  }
  return null;
};
