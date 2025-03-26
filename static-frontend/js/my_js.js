/********************************
Utility functions
********************************/

// Resets selected node/edge to default color & size
function resetSelection() {
  if (!selectedElement) return;

  if (selectedElement.isNode()) {
    const pValue = parseFloat(selectedElement.data('p'));

    selectedElement.style({
      'background-color': getColorByPValue(pValue),
      'width': getSizeByPValue(pValue),
      'opacity': 0.8
    });

  } else {
    // It's an edge => revert
    const rhoV = parseFloat(selectedElement.data('rho'));
    selectedElement.style({
      'line-color': getLineColorByRho(rhoV),
      'width': getLineWidthByRho(rhoV)
    });
  }
  selectedElement = null;
}

// Placeholder for chat logic, now mock echo
async function sendMessage() {
  const msg = chatInput.value.trim();
  chatInput.value = '';

  // Exit early if there's no message
  if (!msg) return;

  // Add user's message to chat history
  const userMsg = document.createElement('div');
  userMsg.innerHTML = `<b>You:</b> ${msg}`;
  chatHistory.appendChild(userMsg);

  try {
    // Send the message to the server
    const response = await fetch('/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: msg })
    });

    // Ensure response is valid
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Parse the server's response
    const data = await response.json();

    // Add the bot's response to chat history
    const botMsg = document.createElement('div');
    botMsg.innerHTML = `<b>Bot:</b> ${data.response}`;
    chatHistory.appendChild(botMsg);
  } catch (error) {
    // Handle errors gracefully
    console.error('Error:', error);

    const botMsg = document.createElement('div');
    botMsg.innerHTML = `<b>Bot:</b> Error: Unable to get response`;
    chatHistory.appendChild(botMsg);
  } finally {
    // Ensure these actions always run
    chatHistory.scrollTop = chatHistory.scrollHeight;

  }
}

// Function to update and show info tooltip (hover-over)
function showTooltip(event, content) {
  tooltip.innerHTML = content;
  tooltip.style.display = 'block';

  // Get the bounding rectangle of the Cytoscape container
  const containerRect = cy.container().getBoundingClientRect();

  // Calculate the x-position: pointer's x relative to the document
  const x = containerRect.left + event.renderedPosition.x;

  // Calculate the y-position: pointer's y relative to the document minus tooltip's height
  // This places the bottom of the tooltip at the pointer's location.
  const y = containerRect.top + event.renderedPosition.y - tooltip.offsetHeight;

  tooltip.style.left = `${x}px`;
  tooltip.style.top = `${y}px`;
}

// Hide tooltip
function hideTooltip() {
  tooltip.style.display = 'none';
}

// Function for getting nodes to preset places (reset-view)
function getBusesToOriginalPlace() {
  // Start a batch update for performance
  cy.startBatch();

  // Reset positions to original positions
  cy.nodes().forEach(node => {
    const originalPosition = originalPositions[node.id()];
    if (originalPosition) {
      node.position(originalPosition); // Set the position
    } else {
      console.error(`No original position found for node ${node.id()}`); // Debugging
    }
  });

  // End batch update
  cy.endBatch();

  // Re-run the 'preset' layout to enforce positions
  cy.layout({ name: 'preset' }).run();
}

// Getting colors of nodes based on power
function getColorByPValue(p) {
  if (p < 0) {
    return '#FBF6F1'; // loads
  } else {
    return '#f9b27b'; // generators
  }
}

// Getting size of nodes based on power
function getSizeByPValue(p) {
  // Take the absolute value of p
  const absP = Math.abs(p)

  // Define the range of p values
  const minP = 0;  // Minimum p value
  const maxP = 100; // Maximum p value

  // Normalize the absolute p value to a range of 0 to 1
  const normalizedP = (absP - minP) / (maxP - minP);

  // Clamp the normalized value to [0, 1]
  const clampedP = Math.max(0, Math.min(1, normalizedP));

  // Scale the size between 20px (small) to 100px (large) based on p
  const minSize = 30;  // Minimum size in pixels
  const maxSize = 80; // Maximum size in pixels

  // Calculate the size based on clamped p
  return minSize + clampedP * (maxSize - minSize);
}

// Getting color of edge based on line capacity
function getLineColorByRho(rho) {
  // Define the range of rho values
  const minRho = 0;   // Minimum rho value
  const maxRho = 1;   // Maximum rho value

  // Normalize the rho value to a range of 0 to 1
  const normalizedRho = (rho - minRho) / (maxRho - minRho);

  // Clamp the normalized value between [0, 1]
  const clampedRho = Math.max(0, Math.min(1, normalizedRho));

  // Define a gradient
  const startColor = [26, 138, 26];
  const endColor = [230, 33, 47];

  return interpolateColor(startColor, endColor, clampedRho);
}

// Getting size of edge based on line capacity
function getLineWidthByRho(rho) {
  // Define the range for line thickness
  const minWidth = 1;  // Minimum line width in pixels
  const maxWidth = 15; // Maximum line width in pixels

  // Normalize and scale the width
  return minWidth + (rho * (maxWidth - minWidth));
}

// Helper function to interpolate between two RGB colors - used for lines
function interpolateColor(color1, color2, factor) {
  const r = Math.round(color1[0] + factor * (color2[0] - color1[0]));
  const g = Math.round(color1[1] + factor * (color2[1] - color1[1]));
  const b = Math.round(color1[2] + factor * (color2[2] - color1[2]));
  return `rgb(${r}, ${g}, ${b})`;
}

// Game-over after blackout in simulation
// TODO: Grey-out only "next step" or add "RESET GAME"/"NEXT SCENARIO" button
function showGameOverBanner() {
  // Create a full-screen overlay
  const overlay = document.createElement('div');
  overlay.id = 'game-over-overlay';
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
  overlay.style.zIndex = '9998';

  // Create the banner element
  const banner = document.createElement('div');
  banner.id = 'game-over-banner';
  banner.innerText = 'GAME OVER';
  banner.style.position = 'absolute';
  banner.style.top = '50%';
  banner.style.left = '50%';
  banner.style.transform = 'translate(-50%, -50%)';
  banner.style.fontSize = '64px';
  banner.style.color = 'white';
  banner.style.textAlign = 'center';

  // Append the banner to the overlay
  overlay.appendChild(banner);

  // Append the overlay to the body
  document.body.appendChild(overlay);

  // Disable interactions
  document.body.style.pointerEvents = 'none';
}


function updateGraphOnServer(updatedElements) {
    return fetch('/graph-data', )
    .then(response => response.json());
}

function fetchAndReloadGraph() {
    return fetch('/graph-data')
        .then(response => response.json())
        .then(elements => {
            // Remove old elements
            cy.elements().remove();

            // Add new elements
            cy.add(elements);
            cy.nodes().ungrabify();

            // Apply the color based on 'p' value
            cy.nodes().forEach(node => {
                const pValue = parseFloat(node.data('p'));
                node.style('background-color', getColorByPValue(pValue));
                node.style('width', getSizeByPValue(pValue));
                node.style('height', getSizeByPValue(pValue));
            });

            cy.edges().forEach(edge => {
                const rhoValue = parseFloat(edge.data('rho'));

                // Apply the color to the edge based on the rho value
                edge.style('line-color', getLineColorByRho(rhoValue));
                edge.style('width', getLineWidthByRho(edge.data('rho')));
            });

            // Layout
            cy.style().update();
            cy.layout({ name: 'preset' }).run();
        });
}

function updateAndFetchGraph() {
    const updatedElements = cy.elements().jsons();

    updateGraphOnServer(updatedElements)
        .then(data => {
            console.log(data.message);
            if (data.done) {
                showGameOverBanner();
            }
            return fetchAndReloadGraph();
        })
        .catch(error => console.error('Error:', error));
}

function disconnectLineAndUpdateChat() {
    if (contextSelectedEdge) {
        const myLineId = contextSelectedEdge.data('my_line_id');

        // 1) Open the chatbox if it's not already open
        chatbox.style.display = 'flex';

        // 2) Add a message as if the user typed "Disconnecting line id X"
        const userMsg = document.createElement('div');
        userMsg.innerHTML = `<b>You:</b> Disconnecting line id ${myLineId}`;
        chatHistory.appendChild(userMsg);

        // Scroll to the bottom of the chat
        chatHistory.scrollTop = chatHistory.scrollHeight;

        // Call the Python function via Flask endpoint
        fetch('/disconnect-line', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({line: parseInt(myLineId)})
        })

        .catch(error => console.error('Error:', error));
    }
    contextMenuEdge.style.display = 'none';
}

function doNothing() {
    fetch('/do-nothing')
}

/********************************
Graph initialization
********************************/
let originalPositions = {};
let cy = cytoscape({
  container: document.getElementById('cytoscape-container'),
  style: [
    {
      selector: 'node',
      style: {
        'background-color': '#5a473a',
        'color': '#fdf2ca',
        'display': 'element',
        'opacity': 0.8,
        'width': 30,
        'height': 30
      }
    },
    {
      selector: 'edge',
      style: {
        'line-color': '#a6836b',
        'width': 4,
        'target-arrow-color': '#a6836b',
        'target-arrow-shape': 'triangle',
        'opacity': 1
      }
    },
    {
      selector: 'node[label]',
      style: {
        'label': 'data(label)'
      }
    }
  ],
  zoom: 1,
  pan: { x: 0, y: 0 },
  elements: [],

   // Zoom settings for smooth zooming
  wheelSensitivity: 0.1,       // Slows down the zoom speed
  minZoom: 0.1,                // Minimum zoom level
  maxZoom: 5,                  // Maximum zoom level
  userZoomingEnabled: true,    // Enable user zooming
  userPanningEnabled: true     // Enable panning
});

// Adjust the URL/path to your JSON file as needed:
fetch('/graph-data')
.then(response => response.json())
.then(elements => {
  cy.add(elements);
  cy.nodes().ungrabify();

  // Apply the color based on 'p' value
  cy.nodes().forEach(node => {
    const pValue = parseFloat(node.data('p'));
    node.style('background-color', getColorByPValue(pValue));
    node.style('width', getSizeByPValue(pValue));
    node.style('height', getSizeByPValue(pValue));
    originalPositions[node.id()] = { ...node.position() };
  });

  cy.edges().forEach(edge => {
    const rhoValue = parseFloat(edge.data('rho'));

    edge.style('line-color', getLineColorByRho(rhoValue));
    edge.style('width', getLineWidthByRho(edge.data('rho')));
  });

    // Layout
    cy.layout({name: 'preset'}).run();
  })
  .catch(error => console.error('Error fetching elements:', error));

/********************************
Event handlers
********************************/
let selectedElement = null;

cy.on('tap', 'node', evt => {
  const node = evt.target;
  resetSelection();

  // Highlight node
  node.style({
    'background-color': '#ffcc00',
    'border-width': 2,
    'border-color': '#ffcc00',
    'opacity': 1
  });

  document.getElementById('info-content').innerHTML = `
    <b>
    Substation ${node.data('id')}<br>
    </b>
    <br>
    p: ${parseFloat(node.data('p')).toFixed(1)} MW<br>
    q: ${parseFloat(node.data('q')).toFixed(1)} MVar<br>
    v: ${parseFloat(node.data('v')).toFixed(1)} kV<br>
    theta: ${node.data('theta')}<br>
  `;
  selectedElement = node;
});

cy.on('tap', 'edge', evt => {
  const edge = evt.target;
  resetSelection();

  // Highlight edge
  edge.style({
    'line-color': '#ffcc00',
  });

  document.getElementById('info-content').innerHTML = `
    <b>
      Edge id ${edge.data('my_line_id')}<br>
      Edge from sub ${edge.data('source')} to sub ${edge.data('target')}<br>
      Capacity: ${parseFloat(edge.data('rho')).toFixed(2)}<br>
    </b>
    <br>
    p: ${parseFloat(edge.data('p')).toFixed(1)} MW<br>
    p or: ${parseFloat(edge.data('p_or')).toFixed(1)} MW<br>
    p ex: ${parseFloat(edge.data('p_ex')).toFixed(1)} MW<br>
    q or: ${parseFloat(edge.data('q_or')).toFixed(1)} MVar<br>
    q ex: ${parseFloat(edge.data('q_ex')).toFixed(1)} MVar<br>
  `;
  selectedElement = edge;
});

// Click on background to reset selection
cy.on('tap', evt => {
  if (evt.target === cy) {
    resetSelection();
    document.getElementById('info-content').innerHTML =
      'Click on a node or edge to see its details here.';
  }
});


/********************************
Chat logic
 ********************************/
const chatbox = document.getElementById('chatbox');
const chatboxHeader = document.getElementById('chatbox-header');
const chatToggle = document.getElementById('chat-toggle');
const chatHistory = document.getElementById('chat-history');
const chatInput = document.getElementById('chat-input');
const sendButton = document.getElementById('send-button');

// Toggle chatbox
chatToggle.addEventListener('click', () => {
  chatbox.style.display =
    (chatbox.style.display === 'flex') ? 'none' : 'flex';
});

// Draggable chatbox
let isDragging = false;
let startX = 0, startY = 0;

chatboxHeader.addEventListener('mousedown', e => {
  isDragging = true;
  startX = e.clientX - chatbox.offsetLeft;
  startY = e.clientY - chatbox.offsetTop;
  chatboxHeader.style.cursor = 'grabbing';
  document.body.style.userSelect = 'none';
});

document.addEventListener('mousemove', e => {
  if (isDragging) {
    chatbox.style.left = `${e.clientX - startX}px`;
    chatbox.style.top = `${e.clientY - startY}px`;
  }
});

document.addEventListener('mouseup', () => {
  isDragging = false;
  chatboxHeader.style.cursor = 'grab';
  document.body.style.userSelect = '';
});

sendButton.addEventListener('click', sendMessage);
chatInput.addEventListener('keypress', e => {
  if (e.key === 'Enter') {
    sendMessage();
  }
});

/********************************
Right-click context menu - now mock-up
 ********************************/
const contextMenuNode = document.getElementById('node-context-menu');
const contextMenuEdge = document.getElementById('edge-context-menu');
const investigateOption = document.getElementById('investigate-option');
const investigateOptionEdge = document.getElementById('edge-investigate-option');
const disconnectEdge = document.getElementById('edge-disconnect');
let contextSelectedNode = null;
let contextSelectedEdge = null;

// Right-click (cxttap) on a node to open the context menu
cy.on('cxttap', 'node', evt => {
  evt.stopPropagation();
  contextSelectedNode = evt.target;

  // Get renderedPosition (pixel coords in the browser)
  const rp = evt.renderedPosition;
  // Get the Cytoscape container's bounding box
  const rect = cy.container().getBoundingClientRect();

  // Position the menu at the correct spot
  contextMenuNode.style.left = (rect.left + rp.x) + 'px';
  contextMenuNode.style.top = (rect.top + rp.y) + 'px';
  contextMenuNode.style.display = 'block';
});


// Right-click (cxttap) on a node to open the context menu
cy.on('cxttap', 'edge', evt => {
  evt.stopPropagation(); // Prevent the event from propagating to other elements
  contextSelectedEdge = evt.target;

  // Get renderedPosition (pixel coords in the browser)
  const rp = evt.renderedPosition;
  // Get the Cytoscape container's bounding box
  const rect = cy.container().getBoundingClientRect();

  // Position the menu at the correct spot
  contextMenuEdge.style.left = (rect.left + rp.x) + 'px';
  contextMenuEdge.style.top = (rect.top + rp.y) + 'px';
  contextMenuEdge.style.display = 'block';
});


// Prevent the browser's default context menu from appearing
document.addEventListener('contextmenu', (event) => {
  event.preventDefault();
});

// Clicking "Investigate"on the node (substation) => open chat and show message
investigateOption.addEventListener('click', () => {
  if (contextSelectedNode) {
    // 1) Open the chatbox if it's not already open
    chatbox.style.display = 'flex';

    // 2) Add a message as if the user typed "investigating bus X"
    const userMsg = document.createElement('div');
    userMsg.innerHTML = `<b>You:</b> investigating substation ${contextSelectedNode.data('id')}`;
    chatHistory.appendChild(userMsg);

    // Scroll to the bottom of the chat
    chatHistory.scrollTop = chatHistory.scrollHeight;
  }
  contextMenuNode.style.display = 'none';
});

// Clicking "Investigate" on the line => open chat and show message
investigateOptionEdge.addEventListener('click', () => {
  if (contextSelectedEdge) {
    // 1) Open the chatbox if it's not already open
    chatbox.style.display = 'flex';

    // 2) Add a message as if the user typed "investigating bus X"
    const userMsg = document.createElement('div');
    userMsg.innerHTML = `<b>You:</b> investigating line id ${contextSelectedEdge.data('my_line_id')}`;
    chatHistory.appendChild(userMsg);

    // Scroll to the bottom of the chat
    chatHistory.scrollTop = chatHistory.scrollHeight;
  }
  contextMenuEdge.style.display = 'none';
});

// Hide the context menu when clicking elsewhere
document.addEventListener('click', evt => {
  if (!contextMenuNode.contains(evt.target)) {
    contextMenuNode.style.display = 'none';
  }
});

document.addEventListener('click', evt => {
  if (!contextMenuEdge.contains(evt.target)) {
    contextMenuEdge.style.display = 'none';
  }
});

const tooltip = document.getElementById('hover-tooltip');


// Attach the function to the button click event
disconnectEdge.addEventListener('click', () => {
    disconnectLineAndUpdateChat();
    nextSimulationStep()
});


/********************************
Hover over element to show info
 ********************************/
// For nodes
cy.on('mouseover', 'node', evt => {
  if (!tooltipsEnabled) return;  // Exit if tooltips are disabled
  const node = evt.target;
  const content = `
    <b>
    Substation ${node.data('id')}<br>
    </b>
    <br>
    p: ${parseFloat(node.data('p')).toFixed(1)} MW<br>
    q: ${parseFloat(node.data('q')).toFixed(1)} MVar<br>
    v: ${parseFloat(node.data('v')).toFixed(1)} kV<br>
    theta: ${node.data('theta')}<br>
  `;
  showTooltip(evt, content);
});

cy.on('mouseout', 'node', hideTooltip);

// For edges
cy.on('mouseover', 'edge', evt => {
  if (!tooltipsEnabled) return;  // Exit if tooltips are disabled
  const edge = evt.target;
  const content = `
    <b>
      Edge id ${edge.data('my_line_id')}<br>
      Edge from sub ${edge.data('source')} to sub ${edge.data('target')}<br>
      Capacity: ${parseFloat(edge.data('rho')).toFixed(2)}<br>
    </b>
    <br>
    p: ${parseFloat(edge.data('p')).toFixed(1)} MW<br>
    p or: ${parseFloat(edge.data('p_or')).toFixed(1)} MW<br>
    p ex: ${parseFloat(edge.data('p_ex')).toFixed(1)} MW<br>
    q or: ${parseFloat(edge.data('q_or')).toFixed(1)} MVar<br>
    q ex: ${parseFloat(edge.data('q_ex')).toFixed(1)} MVar<br>
  `;
  showTooltip(evt, content);
});

cy.on('mouseout', 'edge', hideTooltip);


/********************************
Checkboxes for hover info and dragging nodes
 ********************************/
let tooltipsEnabled = true;
document.getElementById('tooltip-toggle').addEventListener('change', function() {
  tooltipsEnabled = this.checked;
  if (!tooltipsEnabled) {
    hideTooltip(); // Hide tooltip if disabling
  }
});

document.getElementById('drag-toggle').addEventListener('change', function() {
  tooltipsEnabled = this.checked;
  if (tooltipsEnabled) {
    cy.nodes().grabify(); // Allow for grabbing the buses
  }
  else {
    cy.nodes().ungrabify(); // Disable moving the buses
  }
});

/********************************
Button logic
 ********************************/
// Reset View Button Logic
document.getElementById('reset-view').addEventListener('click', () => {
    getBusesToOriginalPlace()
  cy.fit(undefined, 30); // Add optional padding
});
