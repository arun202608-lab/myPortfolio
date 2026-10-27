import { useState } from "react";
import { submitContact } from "../services/api";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [status, setStatus] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    if (status) {
      setStatus("");
      setErrorMessage("");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const trimmedName = formData.name.trim();
    const trimmedEmail = formData.email.trim();
    const trimmedSubject = formData.subject.trim();
    const trimmedMessage = formData.message.trim();

    if (!trimmedName || !trimmedEmail || !trimmedSubject || !trimmedMessage) {
      setStatus("error");
      setErrorMessage("Please fill out all required fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setStatus("error");
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);
    setStatus("");
    setErrorMessage("");

    try {
      const response = await submitContact({
        name: trimmedName,
        email: trimmedEmail,
        subject: trimmedSubject,
        message: trimmedMessage,
      });

      if (response && response.success !== false) {
        setStatus("success");
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
        });
      } else {
        setStatus("error");
        setErrorMessage(
          response?.message || "Failed to send message. Please try again."
        );
      }
    } catch (err) {
      setStatus("error");
      const serverMsg =
        err.response?.data?.message ||
        (err.code === "ERR_NETWORK"
          ? "Unable to connect to the backend server. Please verify the server is running."
          : "Unable to save your message. Please try again.");
      setErrorMessage(serverMsg);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="section contact-section" id="contact">
      <div className="section-heading">
        <p className="section-label">GET IN TOUCH</p>

        <h2>
          Let's <span>Connect</span>
        </h2>

        <p className="section-description">
          Have a project or opportunity in mind? Send me a message.
        </p>
      </div>

      <div className="contact-container">
        <div className="contact-info">
          <h3>Let's work together.</h3>

          <p>
            I'm interested in software development opportunities
            and connecting with people who build useful products.
          </p>

          <div className="contact-detail">
            <span>✉</span>
            <div>
              <small>Email</small>
              <p>arun202608@gmail.com</p>
            </div>
          </div>

          <div className="contact-detail">
            <span>🌐</span>
            <div>
              <small>Phone</small>
              <p>+91 8148645255</p>
            </div>
          </div>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Your Name</label>

              <input
                id="name"
                type="text"
                name="name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleChange}
                maxLength={100}
                autoComplete="name"
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>

              <input
                id="email"
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                maxLength={254}
                autoComplete="email"
                disabled={isSubmitting}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="subject">Subject</label>

            <input
              id="subject"
              type="text"
              name="subject"
              placeholder="Enter message subject"
              value={formData.subject}
              onChange={handleChange}
              maxLength={150}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="message">Your Message</label>

            <textarea
              id="message"
              name="message"
              rows="5"
              placeholder="Write your message..."
              value={formData.message}
              onChange={handleChange}
              maxLength={5000}
              disabled={isSubmitting}
              required
            />
          </div>

          <button
            type="submit"
            className="primary-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Sending Message..." : "Send Message ↗"}
          </button>

          {status === "success" && (
            <p className="form-success" role="status">
              Message sent successfully! Thank you for reaching out.
            </p>
          )}

          {status === "error" && (
            <p className="form-error" role="alert">
              {errorMessage || "Unable to save your message. Please try again."}
            </p>
          )}
        </form>
      </div>
    </section>
  );
}

export default Contact;
