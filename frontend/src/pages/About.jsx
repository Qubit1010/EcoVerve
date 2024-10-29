import { assets } from "../assets/assets";
import NewsletterBox from "../components/NewsletterBox";
import Title from "../components/Title";

const About = () => {
  return (
    <div>
      <div className="text-center text-2xl pt-10 text-gray-500">
        <Title text1={"ABOUT"} text2={"US"} />
      </div>

      <div className="my-10 flex flex-col md:flex-row gap-16">
        <img
          className="w-full md:max-w-[450px]"
          src={assets.about_img}
          alt=""
        />
        <div className="flex flex-col justify-center gap-6 md:w-2/4 text-sm text-gray-600">
          <p>
            Radiance Clinic is a leading U.S.-based healthcare facility
            dedicated to providing exceptional patient care through cutting-edge
            techniques and state-of-the-art medical technology. Our team of
            highly qualified doctors is committed to delivering personalized
            treatment, ensuring the highest standards of safety and
            effectiveness.
          </p>
          <p>
            At Radiance, we prioritize patient well-being and comfort, offering
            a compassionate approach that combines innovation with expertise for
            outstanding healthcare outcomes.
          </p>
          <b className="text-gray-800">Our Mission</b>
          <p>
            At Radiance Clinic, our vision is to redefine healthcare by setting
            a new standard for patient-centered care and clinical excellence. We
            aim to be a beacon of hope and healing, where advanced medical
            techniques and compassionate service come together to enhance the
            quality of life for every individual. We strive to continuously
            innovate, empowering our highly qualified doctors to deliver the
            best possible outcomes while building lasting trust and confidence
            with our patients.
          </p>
        </div>
      </div>

      <div className="text-xl my-4">
        <Title text1={"WHY"} text2={"CHOOSE US"} />
      </div>

      <div className="flex flex-col md:flex-row mb-20">
        <div className="border px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] text-gray-600 cursor-pointer">
          <b>Quality Assurance:</b>
          <p className="text-gray-600">
            Streamlined appointment scheduling that fits into your busy
            lifestyle.
          </p>
        </div>
        <div className="border px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] text-gray-600 cursor-pointer">
          <b>Convenience:</b>
          <p className="text-gray-600">
            Access to a network of trusted healthcare professionals in your
            area.
          </p>
        </div>
        <div className="border px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] text-gray-600 cursor-pointer">
          <b>Exceptional Customer Service:</b>
          <p className="text-gray-600">
            Tailored recommendations and reminders to help you stay on top of
            your health.
          </p>
        </div>
      </div>

      <NewsletterBox />
    </div>
  );
};

export default About;
