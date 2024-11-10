const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const flow = require('./flow.json'); // Load the flow JSON

const app = express();
app.use(bodyParser.json());

const PAGE_ACCESS_TOKEN = '1942974859355742|Ovkeaz6CgZeMzCeOaFS_jn-tw_w';

let userState = {}; // Simple in-memory user state
let userAddress = {}; // Store the address temporarily

app.post('/webhook', (req, res) => {
   const body = req.body;

   if (body.object === 'page') {
      body.entry.forEach(entry => {
         const webhookEvent = entry.messaging[0];
         const senderId = webhookEvent.sender.id;

         if (webhookEvent.message && webhookEvent.message.text) {
            handleUserMessage(senderId, webhookEvent.message.text);
         }
      });
      res.status(200).send('EVENT_RECEIVED');
   } else {
      res.sendStatus(404);
   }
});

function handleUserMessage(userId, messageText) {
   let currentStepKey = userState[userId] || 'start';
   let currentStep = flow.steps[currentStepKey];

   if (currentStepKey === "new_order") {
      // Collect the address
      userAddress[userId] = messageText; // Save the address
      userState[userId] = "confirm_address"; // Move to the next step
      sendMessage(userId, flow.steps["confirm_address"].message);
   } else if (currentStepKey === "confirm_address") {
      // Display the product details
      userState[userId] = "show_product";
      sendProductDetails(userId, flow.steps["show_product"]);
   } else if (currentStep.options && currentStep.nextStep[messageText]) {
      // Move to the next step based on user's choice
      let nextStepKey = currentStep.nextStep[messageText];
      userState[userId] = nextStepKey;
      sendMessage(userId, flow.steps[nextStepKey].message);
   } else if (currentStep.nextStep) {
      // Simple next step
      let nextStepKey = currentStep.nextStep;
      userState[userId] = nextStepKey;
      sendMessage(userId, flow.steps[nextStepKey].message);
   } else {
      sendMessage(userId, "عذرًا، لم أفهم هذا الخيار.");
   }
}

// Send a basic text message
function sendMessage(userId, text) {
   axios.post(`https://graph.facebook.com/v11.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
      recipient: { id: userId },
      message: { text: text }
   }).catch(error => console.error("Error sending message:", error.response.data));
}

// Send product details with image
function sendProductDetails(userId, productStep) {
   const product = productStep.product;
   const text = `اسم المنتج: ${product.name}\nالوصف: ${product.description}\nالسعر: ${product.price}`;

   axios.post(`https://graph.facebook.com/v11.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
      recipient: { id: userId },
      message: { attachment: {
         type: "template",
         payload: {
            template_type: "generic",
            elements: [{
               title: product.name,
               image_url: product.image_url,
               subtitle: product.description,
               buttons: [
                  {
                     type: "postback",
                     title: `السعر: ${product.price}`,
                     payload: "PRICE_INQUIRY"
                  }
               ]
            }]
         }
      }}
   }).catch(error => console.error("Error sending product message:", error.response.data));
}

app.listen(3000, () => {
   console.log('Bot server is running on port 3000');
});
