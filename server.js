const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid'); // Ensure uuid package is installed

const app = express();
const PORT = 3001; // Or any port you prefer

app.use(bodyParser.json());
app.use(cors());

const participantsFilePath = path.join(__dirname, 'data/participant', 'participants.json');

// Helper function to read JSON file
const readJsonFile = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading file:', err);
    return null;
  }
};

// Helper function to write JSON file
const writeJsonFile = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing file:', err);
  }
};

// Endpoint to save form data
app.post('/api/saveFormData', (req, res) => {
  const { formData, participantID, surveyID } = req.body; // Add visitID to the request body
  console.log("Received form data:", formData);

  const filePath = path.join(__dirname, 'data/surveys', 'responses.json');
  let data = readJsonFile(filePath);

  if (!data) {
    data = { responses: [] };
  }

  const existingIndex = data.responses.findIndex(
    response => response.participantID === participantID && response.surveyID === surveyID // Include visitID in the search criteria
  );

  const responseID = existingIndex !== -1 ? data.responses[existingIndex].responseID : uuidv4();

  const newResponse = {
    responseID,
    participantID,
    surveyID,
    formData
  };

  if (existingIndex !== -1) {
    data.responses[existingIndex] = newResponse; // Overwrite existing response
  } else {
    data.responses.push(newResponse); // Add new response
  }

  writeJsonFile(filePath, data);

  res.status(200).json({ message: 'File saved successfully.', responseID });
});

// CRUD Endpoints
app.get('/api/participants', (req, res) => {
  const data = readJsonFile(participantsFilePath);
  if (data) {
    res.status(200).json(data);
  } else {
    res.status(500).json({ message: 'Failed to read participants data.' });
  }
});

app.get('/api/participants/:id', (req, res) => {
  const { id } = req.params;
  const data = readJsonFile(participantsFilePath);
  if (data) {
    const participant = data.find((p) => p.participantID === id);
    if (participant) {
      res.status(200).json(participant);
    } else {
      res.status(404).json({ message: 'Participant not found.' });
    }
  } else {
    res.status(500).json({ message: 'Failed to read participants data.' });
  }
});

app.post('/api/participants', (req, res) => {
  const newParticipant = { ...req.body, participantID: uuidv4() };
  const data = readJsonFile(participantsFilePath);
  if (data) {
    data.push(newParticipant);
    writeJsonFile(participantsFilePath, data);
    res.status(201).json(newParticipant);
  } else {
    res.status(500).json({ message: 'Failed to save new participant.' });
  }
});

app.put('/api/participants/:id', (req, res) => {
  const { id } = req.params;
  const updatedParticipant = req.body;
  const data = readJsonFile(participantsFilePath);
  if (data) {
    const index = data.findIndex((p) => p.participantID === id);
    if (index !== -1) {
      data[index] = { ...updatedParticipant, participantID: id };
      writeJsonFile(participantsFilePath, data);
      res.status(200).json(data[index]);
    } else {
      res.status(404).json({ message: 'Participant not found.' });
    }
  } else {
    res.status(500).json({ message: 'Failed to update participant.' });
  }
});

app.delete('/api/participants/:id', (req, res) => {
  const { id } = req.params;
  const data = readJsonFile(participantsFilePath);
  if (data) {
    const newData = data.filter((p) => p.participantID !== id);
    writeJsonFile(participantsFilePath, newData);
    res.status(204).send();
  } else {
    res.status(500).json({ message: 'Failed to delete participant.' });
  }
});


// Endpoint to get form data for prepopulation
app.get('/api/getFormData', (req, res) => {
  const { participantID, surveyID} = req.query; // Add visitID to query parameters
  const filePath = path.join(__dirname, 'data/surveys', 'responses.json');
  const data = readJsonFile(filePath);

  if (data) {
    const response = data.responses.find(response => response.participantID === participantID && response.surveyID === surveyID); // Include visitID in the search criteria
    if (response) {
      res.status(200).json(response);
    } else {
      res.status(404).json({ message: 'Form data not found.' });
    }
  } else {
    res.status(500).json({ message: 'Failed to read form data.' });
  }
});

// Endpoint to get survey data
app.get('/api/getSurveyData', (req, res) => {
  const { surveyID } = req.query;
  const filePath = path.join(__dirname, 'data/surveys', 'surveys.json');
  const data = readJsonFile(filePath);

  if (data) {
    const survey = data.surveys.find(survey => survey.surveyID === surveyID);
    if (survey) {
      res.status(200).json(survey);
    } else {
      res.status(404).json({ message: 'Survey data not found.' });
    }
  } else {
    res.status(500).json({ message: 'Failed to read survey data.' });
  }
});

// Add more endpoints for other data types as needed
// Example for events
app.get('/api/getEventData', (req, res) => {
  const filePath = path.join(__dirname, 'data/events', 'events.json');
  const data = readJsonFile(filePath);

  if (data) {
    res.status(200).json(data);
  } else {
    res.status(500).json({ message: 'Failed to read event data.' });
  }
});

// Mock user data
const users = [
  { id: 1, userName: 'Sample data', email: 'sample@example.com', userType: 'Admin', userRole: 'Manager', managingLocation: 'Location 1', status: 'Active', lastLogin: '2024-07-25' },
  { id: 2, userName: 'Sample data', email: 'sample@example.com', userType: 'Admin', userRole: 'Manager', managingLocation: 'Location 1', status: 'Active', lastLogin: '2024-07-25' },
  { id: 3, userName: 'Sample data', email: 'sample@example.com', userType: 'Admin', userRole: 'Manager', managingLocation: 'Location 1', status: 'Active', lastLogin: '2024-07-25' },
  { id: 4, userName: 'Sample data', email: 'sample@example.com', userType: 'Admin', userRole: 'Manager', managingLocation: 'Location 1', status: 'Active', lastLogin: '2024-07-25' },
  { id: 5, userName: 'Sample data', email: 'sample@example.com', userType: 'Admin', userRole: 'Manager', managingLocation: 'Location 1', status: 'Active', lastLogin: '2024-07-25' },
  { id: 6, userName: 'Sample data', email: 'sample@example.com', userType: 'Admin', userRole: 'Manager', managingLocation: 'Location 1', status: 'Active', lastLogin: '2024-07-25' },
  { id: 7, userName: 'Sample data', email: 'sample@example.com', userType: 'Admin', userRole: 'Manager', managingLocation: 'Location 1', status: 'Active', lastLogin: '2024-07-25' },
  { id: 8, userName: 'Sample data', email: 'sample@example.com', userType: 'Admin', userRole: 'Manager', managingLocation: 'Location 1', status: 'Active', lastLogin: '2024-07-25' },
  { id: 9, userName: 'Sample data', email: 'sample@example.com', userType: 'Admin', userRole: 'Manager', managingLocation: 'Location 1', status: 'Active', lastLogin: '2024-07-25' }
  // Add more user objects here
];

app.get('/api/users', (req, res) => {
  res.json(users);
});

// Endpoint to get events data
app.get('/api/events', (req, res) => {
  const filePath = path.join(__dirname, 'data/events/events.json');
  const data = readJsonFile(filePath);
  
  if (data) {
    res.status(200).json(data.events);
  } else {
    res.status(500).json({ message: 'Failed to read events data.' });
  }
});

// Endpoint to save event data
app.post('/api/events', (req, res) => {
  const { event } = req.body;
  const filePath = path.join(__dirname, 'data/events/events.json');
  let data = readJsonFile(filePath);

  if (!data) {
    data = { events: [] };
  }

  const newEvent = {
    ...event,
    id: `${data.events.length + 1}`
  };

  data.events.push(newEvent);
  writeJsonFile(filePath, data);

  res.status(200).json({ message: 'Event saved successfully.', event: newEvent });
});

// Endpoint to delete events
app.post('/api/events/delete', (req, res) => {
  const { eventIDs } = req.body;
  const filePath = path.join(__dirname, 'data/events/events.json');
  let data = readJsonFile(filePath);

  if (!data) {
    data = { events: [] };
  }

  data.events = data.events.filter(event => !eventIDs.includes(event.id));
  writeJsonFile(filePath, data);

  res.status(200).json({ message: 'Events deleted successfully.' });
});


const messagesFilePath = path.join(__dirname, 'data/messages', 'messages.json');

// Endpoint to get messages data
app.get('/api/messages', (req, res) => {
  const data = readJsonFile(messagesFilePath);
  
  if (data) {
    res.status(200).json(data);
  } else {
    res.status(500).json({ message: 'Failed to read messages data.' });
  }
});

// Endpoint to save message data
app.post('/api/messages', (req, res) => {
  const { message } = req.body;
  const data = readJsonFile(messagesFilePath);

  if (!data) {
    data = { messages: [] };
  }

  const newMessage = {
    ...message,
    id: uuidv4(), // Generate a unique ID for the new message
  };

  data.messages.push(newMessage);
  writeJsonFile(messagesFilePath, data);

  res.status(200).json({ message: 'Message saved successfully.', newMessage });
});

// Endpoint to delete messages
app.post('/api/messages/delete', (req, res) => {
  const { messageIDs } = req.body;
  const data = readJsonFile(messagesFilePath);

  if (!data) {
    return res.status(500).json({ message: 'Failed to read messages data.' });
  }

  data.messages = data.messages.filter(message => !messageIDs.includes(message.id));
  writeJsonFile(messagesFilePath, data);

  res.status(200).json({ message: 'Messages deleted successfully.' });
});

// Endpoint to get a message by ID
app.get('/api/messages/:id', (req, res) => {
  const { id } = req.params;
  console.log(id)
  const filePath = path.join(__dirname, 'data/messages/messages.json');
  const data = readJsonFile(filePath);

  if (data) {
    const message = data.messages.find(msg => msg.id === id);
    if (message) {
      res.status(200).json(message);
    } else {
      res.status(404).json({ message: 'Message not found.' });
    }
  } else {
    res.status(500).json({ message: 'Failed to read messages data.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});