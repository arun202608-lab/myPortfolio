
const STORAGE_KEY = "arun_portfolio_messages";

function readMessages() {
  try {
    const storedMessages = localStorage.getItem(STORAGE_KEY);

    if (!storedMessages) {
      return [];
    }

    const messages = JSON.parse(storedMessages);

    return Array.isArray(messages) ? messages : [];
  } catch {
    return [];
  }
}

function writeMessages(messages) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(messages)
    );

    return true;
  } catch {
    return false;
  }
}

export function saveMessage(formData) {
  try {
    const messages = readMessages();

    const newMessage = {
      id: crypto.randomUUID(),
      name: formData.name.trim(),
      email: formData.email.trim(),
      subject: formData.subject.trim(),
      message: formData.message.trim(),
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    if (
      !newMessage.name ||
      !newMessage.email ||
      !newMessage.subject ||
      !newMessage.message
    ) {
      return false;
    }

    messages.unshift(newMessage);

    return writeMessages(messages);
  } catch {
    return false;
  }
}

export function getMessages() {
  return readMessages();
}

export function toggleMessageRead(id) {
  const messages = readMessages();

  const updatedMessages = messages.map((message) =>
    message.id === id
      ? { ...message, isRead: !message.isRead }
      : message
  );

  return writeMessages(updatedMessages);
}

export function deleteMessage(id) {
  const messages = readMessages();

  const updatedMessages = messages.filter(
    (message) => message.id !== id
  );

  return writeMessages(updatedMessages);
}

