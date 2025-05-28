"use client";

import type React from "react";

import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, Send, MessageCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Message Sent!",
          description: result.message,
        });
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        });
      } else {
        throw new Error(result.error || "Failed to send message");
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="container mx-auto">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl font-bold bg-gradient-to-r from-emerald-900 to-emerald-700 bg-clip-text text-transparent mb-6">
              Contact Us
            </h1>
            <p className="text-xl text-emerald-700 leading-relaxed">
              Have questions about our products or services? We'd love to hear
              from you. Get in touch with our team and we'll respond as soon as
              possible.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Information Cards */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              {
                icon: Phone,
                title: "Phone",
                info: "+92 (300) 123-4567",
                description: "Call us for immediate assistance",
                color: "emerald",
              },
              {
                icon: Mail,
                title: "Email",
                info: "info@tmc-chicken.com",
                description: "Send us your questions anytime",
                color: "blue",
              },
              {
                icon: MapPin,
                title: "Location",
                info: "Faisalabad, Pakistan",
                description: "We deliver across the city",
                color: "green",
              },
              {
                icon: Clock,
                title: "Business Hours",
                info: "9 AM - 9 PM",
                description: "Daily service available",
                color: "purple",
              },
            ].map((contact, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="text-center border-emerald-200 hover:shadow-lg transition-all duration-300 group h-full">
                  <CardContent className="p-6">
                    <motion.div
                      className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <contact.icon className="h-8 w-8 text-emerald-600" />
                    </motion.div>
                    <h3 className="text-lg font-bold text-emerald-900 mb-2">
                      {contact.title}
                    </h3>
                    <p className="text-emerald-800 font-medium mb-2">
                      {contact.info}
                    </p>
                    <p className="text-emerald-600 text-sm">
                      {contact.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Contact Form and Map Section */}
      <section className="py-20 bg-emerald-50">
        <div className="container mx-auto px-4">
          <motion.div
            className="grid lg:grid-cols-2 gap-16"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {/* Contact Form */}
            <motion.div variants={fadeInUp}>
              <Card className="border-emerald-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-emerald-900 flex items-center">
                    <MessageCircle className="mr-3 h-6 w-6 text-emerald-600" />
                    Send us a Message
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium text-emerald-700 mb-2"
                        >
                          Full Name *
                        </label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          required
                          value={formData.name}
                          onChange={handleInputChange}
                          className="border-emerald-200 focus:border-emerald-500"
                          placeholder="Your full name"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-emerald-700 mb-2"
                        >
                          Email Address *
                        </label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          className="border-emerald-200 focus:border-emerald-500"
                          placeholder="your.email@example.com"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="phone"
                          className="block text-sm font-medium text-emerald-700 mb-2"
                        >
                          Phone Number
                        </label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="border-emerald-200 focus:border-emerald-500"
                          placeholder="+92 300 1234567"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="subject"
                          className="block text-sm font-medium text-emerald-700 mb-2"
                        >
                          Subject *
                        </label>
                        <Input
                          id="subject"
                          name="subject"
                          type="text"
                          required
                          value={formData.subject}
                          onChange={handleInputChange}
                          className="border-emerald-200 focus:border-emerald-500"
                          placeholder="What is this about?"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="message"
                        className="block text-sm font-medium text-emerald-700 mb-2"
                      >
                        Message *
                      </label>
                      <Textarea
                        id="message"
                        name="message"
                        required
                        value={formData.message}
                        onChange={handleInputChange}
                        className="border-emerald-200 focus:border-emerald-500 min-h-[120px]"
                        placeholder="Tell us more about your inquiry..."
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white py-3"
                    >
                      {isSubmitting ? (
                        "Sending..."
                      ) : (
                        <>
                          Send Message
                          <Send className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {/* Business Information */}
            <motion.div variants={fadeInUp} className="space-y-8">
              <Card className="border-emerald-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-emerald-900">
                    Visit Our Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <MapPin className="h-5 w-5 text-emerald-600 mt-1" />
                      <div>
                        <p className="font-medium text-emerald-900">
                          TMC - The Marinated Chicken
                        </p>
                        <p className="text-emerald-700">
                          Faisalabad, Punjab, Pakistan
                        </p>
                        <p className="text-emerald-600 text-sm">
                          Serving all areas of Faisalabad
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Clock className="h-5 w-5 text-emerald-600" />
                      <div>
                        <p className="font-medium text-emerald-900">
                          Business Hours
                        </p>
                        <p className="text-emerald-700">
                          Monday - Sunday: 9:00 AM - 9:00 PM
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-emerald-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-emerald-900">
                    Quick Response
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-emerald-700">
                      We typically respond to all inquiries within 2-4 hours
                      during business hours.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-emerald-700">
                          General inquiries: Same day response
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm text-emerald-700">
                          Business partnerships: 1-2 business days
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-emerald-700">
                          Technical support: Within 24 hours
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-emerald-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-emerald-900">
                    Other Ways to Reach Us
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Phone className="h-4 w-4 text-emerald-600" />
                      <span className="text-emerald-700">
                        WhatsApp: +92 300 123-4567
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MessageCircle className="h-4 w-4 text-emerald-600" />
                      <span className="text-emerald-700">
                        Live Chat: Available on website
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="h-4 w-4 text-emerald-600" />
                      <span className="text-emerald-700">
                        Support: support@tmc-chicken.com
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-emerald-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-emerald-700 max-w-2xl mx-auto">
              Quick answers to common questions about our products and services
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              {
                question: "What are your delivery hours?",
                answer:
                  "We deliver from 10 AM to 8 PM, Monday through Sunday. Same-day delivery is available for orders placed before 2 PM.",
              },
              {
                question: "Do you offer bulk discounts?",
                answer:
                  "Yes! We offer special pricing for business customers and bulk orders. Contact us for a custom quote based on your requirements.",
              },
              {
                question: "How fresh is the chicken?",
                answer:
                  "All our chicken is marinated fresh daily using premium ingredients. We never use frozen chicken for marination.",
              },
              {
                question: "What payment methods do you accept?",
                answer:
                  "We currently accept cash on delivery (COD). We're working on adding online payment options soon.",
              },
              {
                question: "Can I customize the spice level?",
                answer:
                  "We can adjust the spice level for most of our recipes. Just mention your preference when ordering.",
              },
              {
                question: "Do you cater to events?",
                answer:
                  "Yes, we provide catering services for events, parties, and corporate functions. Contact us at least 24 hours in advance.",
              },
            ].map((faq, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="border-emerald-200 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-emerald-900 mb-3">
                      {faq.question}
                    </h3>
                    <p className="text-emerald-700">{faq.answer}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-emerald-800 to-emerald-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-4xl font-bold mb-6">Ready to Order?</h2>
            <p className="text-xl mb-8 text-emerald-100">
              Don't wait! Experience the premium quality and authentic flavors
              of TMC marinated chicken today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/products"
                className="bg-white text-emerald-800 hover:bg-emerald-50 px-8 py-4 rounded-lg font-medium transition-colors"
              >
                Browse Products
              </a>
              <a
                href="tel:+923001234567"
                className="border-2 border-white text-white hover:bg-white hover:text-emerald-800 px-8 py-4 rounded-lg font-medium transition-colors"
              >
                Call Now
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
