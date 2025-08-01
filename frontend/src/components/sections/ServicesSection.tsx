import { Smile, Shield, Zap, Heart, Eye, Baby } from 'lucide-react';
import { Link } from 'react-router'
import { useNavigate } from 'react-router';
const services = [
  {
    icon: Smile,
    title: "Nha Khoa Tổng Quát",
    slug: "general-dentistry",
    description: "Chăm sóc nha khoa toàn diện bao gồm làm sạch, trám và kiểm tra định kỳ để duy trì sức khỏe răng miệng của bạn."
  },
  {
    icon: Shield,
    title: "Chăm Sóc Phòng Ngừa",
    slug: "preventive-care",
    description: "Các phương pháp điều trị và giáo dục phòng ngừa giúp bạn tránh các vấn đề nha khoa trước khi chúng xảy ra."
  },
  {
    icon: Zap,
    title: "Nha Khoa Thẩm Mỹ",
    slug: "cosmetic-dentistry",
    description: "Biến đổi nụ cười của bạn với các dịch vụ làm trắng răng, bọc sứ và các thủ tục thẩm mỹ khác."
  },
  {
    icon: Heart,
    title: "Nha Khoa Phục Hồi",
    slug: "restorative-dentistry",
    description: "Khôi phục răng bị hư hại bằng mão, cầu răng và cấy ghép implant sử dụng công nghệ mới nhất."
  },
  {
    icon: Eye,
    title: "Phẫu Thuật Răng Miệng",
    slug: "oral-surgery",
    description: "Các thủ tục phẫu thuật răng miệng an toàn và thoải mái bao gồm nhổ răng khôn."
  },
  {
    icon: Baby,
    title: "Nha Khoa Nhi Khoa",
    slug: "pediatric-dentistry",
    description: "Chăm sóc nha khoa chuyên biệt cho trẻ em trong môi trường thân thiện và thoải mái."
  }
];

export const ServicesSection = () => {
  const navigate = useNavigate();
  return (
    <section id="services" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Dịch Vụ Của Chúng Tôi
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Chúng tôi cung cấp đầy đủ các dịch vụ nha khoa để giữ cho nụ cười của bạn luôn khỏe mạnh và đẹp
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-xl p-8 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="bg-blue-100 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                <service.icon className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {service.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {service.description}
              </p>
              <Link
                to={`/services/${service.slug}`}
                className="mt-6 text-blue-600 font-medium hover:text-blue-700 transition-colors"
              >
                Tìm Hiểu Thêm →
              </Link>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <button onClick={() => navigate("/appointment-booking")} className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            Đặt Lịch Tư Vấn
          </button>
        </div>
      </div>
    </section>
  );
};