"use client";

import { motion } from "framer-motion";
import { Users, Award, Heart, Target, Eye, Star } from "lucide-react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

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

export default function AboutPage() {
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
              About TMC
            </h1>
            <p className="text-xl text-emerald-700 leading-relaxed">
              Since 2020, TMC has been dedicated to bringing premium marinated
              chicken to families and businesses across Faisalabad. Our
              commitment to quality, freshness, and authentic flavors has made
              us the trusted choice for thousands of customers.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            className="grid lg:grid-cols-2 gap-16 items-center"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <motion.div variants={fadeInUp}>
              <h2 className="text-4xl font-bold text-emerald-900 mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-emerald-700">
                <p>
                  TMC was born from a simple idea: to provide busy families and
                  businesses with premium quality marinated chicken that saves
                  time without compromising on taste or nutrition.
                </p>
                <p>
                  Our founder, a passionate chef with over 15 years of
                  experience, noticed that people were struggling to find
                  high-quality, ready-to-cook marinated chicken in Faisalabad.
                  This gap in the market inspired the creation of TMC.
                </p>
                <p>
                  Today, we're proud to serve over 1,000 satisfied customers and
                  50+ business partners with our 6 signature recipes, each
                  crafted with care and using only the finest natural
                  ingredients.
                </p>
              </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="relative">
              <Image
                src="/placeholder.svg?height=500&width=600&query=chef preparing marinated chicken in kitchen"
                alt="Our Kitchen"
                width={600}
                height={500}
                className="rounded-2xl shadow-xl"
              />
              <div className="absolute -bottom-6 -right-6 bg-emerald-600 text-white p-6 rounded-2xl shadow-lg">
                <div className="text-center">
                  <div className="text-3xl font-bold">4+</div>
                  <div className="text-sm">Years of Excellence</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="py-20 bg-emerald-50">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-emerald-900 mb-4">
              Our Foundation
            </h2>
            <p className="text-xl text-emerald-700 max-w-2xl mx-auto">
              The principles that guide everything we do at TMC
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              {
                icon: Target,
                title: "Our Mission",
                description:
                  "To provide premium quality marinated chicken that brings families together around delicious, healthy meals while supporting local businesses with reliable bulk supply solutions.",
              },
              {
                icon: Eye,
                title: "Our Vision",
                description:
                  "To become Pakistan's leading premium marinated chicken brand, known for quality, innovation, and exceptional customer service across all major cities.",
              },
              {
                icon: Heart,
                title: "Our Values",
                description:
                  "Quality first, customer satisfaction, sustainability, community support, and continuous innovation in everything we do.",
              },
            ].map((item, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="h-full border-emerald-200 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <item.icon className="h-8 w-8 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-bold text-emerald-900 mb-4">
                      {item.title}
                    </h3>
                    <p className="text-emerald-700">{item.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-emerald-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-xl text-emerald-700 max-w-2xl mx-auto">
              The passionate people behind TMC's success
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              {
                name: "MUHAMMAD HANZALA",
                role: "Founder & Head Chef",
                image:
                  "/placeholder.svg?height=300&width=300&query=professional chef portrait Muhammad Hanzala",
                description:
                  "15+ years of culinary experience with a passion for creating authentic flavors.",
              },
              {
                name: "MINAHIL ISMAIL",
                role: "Operations Manager",
                image:
                  "/placeholder.svg?height=300&width=300&query=professional woman manager Minahil Ismail",
                description:
                  "Ensures quality control and smooth operations across all our processes.",
              },
              {
                name: "MARIA ANEES",
                role: "Business Development",
                image:
                  "/placeholder.svg?height=300&width=300&query=professional businesswoman Maria Anees",
                description:
                  "Builds partnerships with restaurants and businesses across Faisalabad.",
              },
            ].map((member, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="overflow-hidden border-emerald-200 hover:shadow-lg transition-all duration-300">
                  <div className="relative h-64">
                    <Image
                      src={member.image || "/placeholder.svg"}
                      alt={member.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardContent className="p-6 text-center">
                    <h3 className="text-xl font-bold text-emerald-900 mb-2">
                      {member.name}
                    </h3>
                    <p className="text-emerald-600 font-medium mb-3">
                      {member.role}
                    </p>
                    <p className="text-emerald-700 text-sm">
                      {member.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Quality Process */}
      <section className="py-20 bg-emerald-50">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-emerald-900 mb-4">
              Our Quality Process
            </h2>
            <p className="text-xl text-emerald-700 max-w-2xl mx-auto">
              From sourcing to delivery, every step is carefully managed to
              ensure premium quality
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              {
                step: "01",
                title: "Premium Sourcing",
                description:
                  "We source only the finest chicken from trusted local farms that meet our strict quality standards.",
              },
              {
                step: "02",
                title: "Expert Marination",
                description:
                  "Our signature recipes are applied using traditional techniques perfected over years of experience.",
              },
              {
                step: "03",
                title: "Quality Control",
                description:
                  "Every batch undergoes rigorous quality checks to ensure consistency and freshness.",
              },
              {
                step: "04",
                title: "Fresh Delivery",
                description:
                  "Same-day preparation and delivery to maintain maximum freshness and flavor.",
              },
            ].map((process, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="text-center"
              >
                <div className="w-16 h-16 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  {process.step}
                </div>
                <h3 className="text-lg font-bold text-emerald-900 mb-3">
                  {process.title}
                </h3>
                <p className="text-emerald-700 text-sm">
                  {process.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Awards & Recognition */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-emerald-900 mb-4">
              Awards & Recognition
            </h2>
            <p className="text-xl text-emerald-700 max-w-2xl mx-auto">
              Our commitment to excellence has been recognized by customers and
              industry experts
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              {
                icon: Award,
                title: "Best Quality Award 2023",
                description:
                  "Recognized by Faisalabad Food Association for outstanding quality standards.",
              },
              {
                icon: Star,
                title: "Customer Choice Award",
                description:
                  "Voted as the preferred marinated chicken brand by local customers.",
              },
              {
                icon: Users,
                title: "Business Partner Excellence",
                description:
                  "Acknowledged for reliable service to restaurant and catering partners.",
              },
            ].map((award, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="text-center border-emerald-200 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-8">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <award.icon className="h-8 w-8 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-bold text-emerald-900 mb-4">
                      {award.title}
                    </h3>
                    <p className="text-emerald-700">{award.description}</p>
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
            <h2 className="text-4xl font-bold mb-6">Join the TMC Family</h2>
            <p className="text-xl mb-8 text-emerald-100">
              Experience the difference that quality, passion, and dedication
              make. Become part of our growing community of satisfied customers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/products"
                className="bg-white text-emerald-800 hover:bg-emerald-50 px-8 py-4 rounded-lg font-medium transition-colors"
              >
                Shop Now
              </a>
              <a
                href="/contact"
                className="border-2 border-white text-white hover:bg-white hover:text-emerald-800 px-8 py-4 rounded-lg font-medium transition-colors"
              >
                Contact Us
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
