 
import { useState } from "react";
import { saveMessage } from "../utils/storage";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [status, setStatus] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const result = saveMessage(formData);

    if (result) {
      setStatus("success");
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } else {
      setStatus("error");
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
              <p>your-email@example.com</p>
            </div>
          </div>

          <div className="contact-detail">
            <span>🌐</span>
            <div>
              <small>Availability</small>
              <p>Open to opportunities</p>
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
              required
            />
          </div>

          <button type="submit" className="primary-button">
            Send Message ↗
          </button>

          {status === "success" && (
            <p className="form-success" role="status">
              Message saved successfully!
            </p>
          )}

          {status === "error" && (
            <p className="form-error" role="alert">
              Unable to save your message. Please try again.
            </p>
          )}
        </form>
      </div>
    </section>
  );
}

export default Contact;
 
