const axios = require('axios');
const flow = require('../flow.json'); // Import flow
const PAGE_ACCESS_TOKEN = 'EAAL9lpMYE4EBO0wK4lRyLeOKpVlgKGBxBRZBMM9CD2Dn40O2oGsxJu21ZAQ3QEY1WbV6wSjvJvmST0LKTzxUFK7TXCbsXhJsG6ZBY1ZAmbbTScc4pA071r6OhPRJ7JkJ6RZBcAaxpbg0ae0FYiJ6HRWw48UZAHc7YGtrFxSiLkZAsyYdfZB2oSpRguzGQXXC3lBhmQZDZD'; // Facebook Page Access Token

let userState = {}; // In-memory user state
let userAddress = {}; // Store user addresses temporarily

module.exports = async (req, res) => {
   if (req.method === 'POST') {
      const body = req.body;

      // Send immediate acknowledgment to Facebook
      res.status(200).send('EVENT_RECEIVED');

      if (body.object === 'page') {
         body.entry.forEach(entry => {
            const webhookEvent = entry.messaging[0];
            const senderId = webhookEvent.sender.id;

            if (webhookEvent.message && webhookEvent.message.text) {
               handleUserMessage(senderId, webhookEvent.message.text);
            }
         });
      }
   } else if (req.method === 'GET') {
      // Webhook verification
      const VERIFY_TOKEN = 'testest'; // Use environment variable for security
      const mode = req.query['hub.mode'];
      const token = req.query['hub.verify_token'];
      const challenge = req.query['hub.challenge'];

      if (mode === 'subscribe' && token === VERIFY_TOKEN) {
         res.status(200).send(challenge);
      } else {
         res.sendStatus(403);
      }
   }
};

async function handleUserMessage(userId, messageText) {
   let currentStepKey = userState[userId] || 'start';
   let currentStep = flow.steps[currentStepKey];

   // Log the current step and user input for debugging
   console.log(`Current Step: ${currentStepKey}`);
   console.log(`User Input: ${messageText}`);
   console.log(`Expected Options:`, currentStep.options);

   if (!currentStep) {
      console.error(`Step "${currentStepKey}" not found in flow`);
      sendMessage(userId, "حدث خطأ، الرجاء المحاولة مرة أخرى.");
      userState[userId] = 'start';
      return;
   }

   // Handle new order address input
   if (currentStepKey === "new_order") {
      userAddress[userId] = messageText;
      userState[userId] = "confirm_address";
      sendMessage(userId, flow.steps["confirm_address"].message);
      userState[userId] = "show_product";
      showProduct(userId);
      return;
   }

   // Handle product display step
   if (currentStepKey === "confirm_address") {
      userState[userId] = "show_product";
      showProduct(userId);
      return;
   }

   // If options exist, check for valid user response
   if (currentStep.options && currentStep.nextStep && typeof currentStep.nextStep[messageText] === 'string') {
      let nextStepKey = currentStep.nextStep[messageText];
      userState[userId] = nextStepKey;
      let nextStep = flow.steps[nextStepKey];

      if (!nextStep) {
         console.error(`Step "${nextStepKey}" not found in flow`);
         sendMessage(userId, "حدث خطأ، الرجاء المحاولة مرة أخرى.");
         userState[userId] = 'start';
         return;
      }

      sendMessage(userId, nextStep.message);
   } else if (currentStep.nextStep && typeof currentStep.nextStep === 'string') {
      let nextStepKey = currentStep.nextStep;
      userState[userId] = nextStepKey;
      let nextStep = flow.steps[nextStepKey];

      if (!nextStep) {
         console.error(`Step "${nextStepKey}" not found in flow`);
         sendMessage(userId, "حدث خطأ، الرجاء المحاولة مرة أخرى.");
         userState[userId] = 'start';
         return;
      }

      sendMessage(userId, nextStep.message);
   } else {
      // Handle undefined input or option
      console.log("User input did not match any expected options.");
      sendMessage(userId, "عذرًا، لم أفهم هذا الخيار.");
   }
}


function sendMessage(userId, text) {
   console.log(`Sending message to ${userId}: ${text}`);
   axios.post(`https://graph.facebook.com/v21.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
      recipient: { id: userId },
      message: { text: text }
   }).catch(error => console.error("Error sending message:", error.response.data));
}

function showProduct(userId) {
   const product = flow.steps["show_product"].product;
   axios.post(`https://graph.facebook.com/v21.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
      recipient: { id: userId },
      message: {
         attachment: {
            type: "template",
            payload: {
               template_type: "generic",
               elements: [
                  {
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
                  }
               ]
            }
         }
      }
   }).catch(error => console.error("Error sending product message:", error.response.data));
}
