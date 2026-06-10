import { Link } from 'react-router-dom';
import heroImg from '../assets/hero.png';

const categories = [
  { name: 'Barber', icon: '💈', color: 'bg-blue-900/50 text-blue-300 border-blue-800' },
  { name: 'Nail Technician', icon: '💅', color: 'bg-pink-900/50 text-pink-300 border-pink-800' },
  { name: 'Electrician', icon: '⚡', color: 'bg-yellow-900/50 text-yellow-300 border-yellow-800' },
  { name: 'Plumber', icon: '🔧', color: 'bg-indigo-900/50 text-indigo-300 border-indigo-800' },
  { name: 'Mechanic', icon: '🔩', color: 'bg-gray-800 text-gray-300 border-gray-700' },
  { name: 'Painter', icon: '🎨', color: 'bg-purple-900/50 text-purple-300 border-purple-800' },
  { name: 'Cleaner', icon: '🧹', color: 'bg-green-900/50 text-green-300 border-green-800' },
  { name: 'Carpenter', icon: '🔨', color: 'bg-orange-900/50 text-orange-300 border-orange-800' },
];

const featuredProviders = [
  { name: 'Joseph Plumbing Services', service: 'Plumber', rating: 4.9, jobs: 150, distance: '2.5 km', img: '👨‍🔧' },
  { name: 'Jane Makeup Studio', service: 'Makeup Artist', rating: 4.8, jobs: 89, distance: '1.2 km', img: '👩‍🎨' },
  { name: 'Mike Auto Works', service: 'Mechanic', rating: 4.7, jobs: 210, distance: '3.1 km', img: '👨‍🔧' },
];

const stats = [
  { value: '2,500+', label: 'Active Providers' },
  { value: '15,000+', label: 'Happy Customers' },
  { value: '50+', label: 'Service Categories' },
  { value: '4.8★', label: 'Average Rating' },
];

const testimonials = [
  {
    text: 'Found an electrician within 15 minutes. Great service! The whole process was seamless from booking to completion.',
    author: 'Peter',
    location: 'Nairobi',
    rating: 5,
    role: 'Homeowner'
  },
  {
    text: 'The barber was professional and on time. Highly recommend! My go-to app for all personal care services.',
    author: 'Mary',
    location: 'Karen',
    rating: 5,
    role: 'Regular Customer'
  },
  {
    text: 'Easy to use and the payment via M-Pesa was seamless. Got my phone fixed in under an hour!',
    author: 'James',
    location: 'Westlands',
    rating: 5,
    role: 'Tech Professional'
  },
];

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-600'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-surface/90 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                MtaaniConnect
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#services" className="text-gray-300 hover:text-primary transition-colors">Services</a>
              <a href="#how-it-works" className="text-gray-300 hover:text-primary transition-colors">How It Works</a>
              <a href="#testimonials" className="text-gray-300 hover:text-primary transition-colors">Testimonials</a>
              <Link to="/login" className="text-gray-300 hover:text-primary transition-colors">Login</Link>
              <Link
                to="/register"
                className="bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-primary-dark transition-all hover:shadow-lg hover:shadow-primary/30 transform hover:-translate-y-0.5"
              >
                Sign Up
              </Link>
            </div>
            <div className="md:hidden">
              <button className="text-gray-300 p-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-dark via-primary to-secondary text-white py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.05),transparent_50%)]"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Find Trusted Service<br />
                <span className="text-secondary">Providers Near You</span>
              </h1>
              <p className="text-lg md:text-xl text-blue-200 mb-10 max-w-2xl leading-relaxed">
                Book plumbers, electricians, barbers, cleaners, mechanics, tutors and more in minutes.
                <span className="block mt-2 text-white/90">Reliable. Fast. Local.</span>
              </p>

              <div className="bg-surface p-6 md:p-8 rounded-3xl shadow-2xl border border-border">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative group">
                    <span className="absolute left-4 top-4 text-gray-400 group-focus-within:text-primary transition-colors">🔍</span>
                    <input
                      type="text"
                      placeholder="What service do you need?"
                      className="w-full pl-12 pr-4 py-4 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-100 bg-background hover:bg-surface transition-colors placeholder-gray-500"
                    />
                  </div>
                  <div className="relative group">
                    <span className="absolute left-4 top-4 text-gray-400 group-focus-within:text-primary transition-colors">📍</span>
                    <input
                      type="text"
                      placeholder="Your location"
                      className="w-full pl-12 pr-4 py-4 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-100 bg-background hover:bg-surface transition-colors placeholder-gray-500"
                    />
                  </div>
                  <Link
                    to="/services"
                    className="btn-primary text-center flex items-center justify-center rounded-xl py-4 px-8 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
                  >
                    Find Services
                  </Link>
                </div>
                <div className="mt-5">
                  <Link
                    to="/register"
                    className="text-secondary font-semibold hover:text-secondary-dark transition-colors inline-flex items-center gap-2 group"
                  >
                    Become a Provider
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                </div>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-3xl"></div>
                <img
                  src={heroImg}
                  alt="Service professionals"
                  className="relative rounded-3xl shadow-2xl border border-border/50 w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-surface border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center group">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-400 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Categories */}
      <section id="services" className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-text mb-4">Popular Services</h2>
            <p className="text-lg text-text-light max-w-2xl mx-auto">
              Choose from our wide range of professional services
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((cat, idx) => (
              <div
                key={cat.name}
                className="group relative bg-surface rounded-2xl p-6 text-center hover:shadow-2xl transition-all duration-300 cursor-pointer border border-border hover:border-primary/30 hover:-translate-y-2"
              >
                <div className={`w-20 h-20 ${cat.color} rounded-2xl flex items-center justify-center text-4xl mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 border`}>
                  {cat.icon}
                </div>
                <h3 className="font-bold text-text text-lg">{cat.name}</h3>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              to="/services"
              className="btn-primary inline-block px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
            >
              View All Services
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Professionals */}
      <section className="py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-text mb-4">Featured Professionals</h2>
            <p className="text-lg text-text-light max-w-2xl mx-auto">
              Top-rated providers in your area, ready to help
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProviders.map((provider) => (
              <div
                key={provider.name}
                className="group relative bg-surface rounded-3xl p-8 hover:shadow-2xl transition-all duration-300 border border-border hover:border-primary/30 hover:-translate-y-2"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-bl-full"></div>

                <div className="flex items-center mb-5">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center text-4xl mr-5 shadow-sm group-hover:scale-110 transition-transform duration-300">
                    {provider.img}
                  </div>
                  <div>
                    <h3 className="font-bold text-text text-lg">{provider.name}</h3>
                    <p className="text-sm text-text-light">{provider.service}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <StarRating rating={Math.round(provider.rating)} />
                      <span className="text-sm font-semibold text-accent">{provider.rating}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-text-light mb-5">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{provider.distance} away</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-text-light mb-6">
                  <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{provider.jobs} jobs completed</span>
                </div>

                <Link
                  to="/booking"
                  className="btn-primary w-full text-center block py-4 rounded-xl font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
                >
                  Book Now
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-gradient-to-b from-background to-surface relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.02),transparent_50%)]"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-text mb-4">How It Works</h2>
            <p className="text-lg text-text-light max-w-2xl mx-auto">
              Get started in 3 simple steps
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { step: '01', icon: '🔍', title: 'Search Service', desc: 'Browse categories or search for the service you need from our verified providers' },
              { step: '02', icon: '👤', title: 'Choose Provider', desc: 'Compare ratings, reviews, and prices to find the perfect match for your needs' },
              { step: '03', icon: '💳', title: 'Book & Pay', desc: 'Book instantly and pay securely via M-Pesa or cash on delivery' },
            ].map((item, idx) => (
              <div key={idx} className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative text-center">
                  <div className="relative inline-block mb-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center text-5xl mx-auto shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                      {item.icon}
                    </div>
                    <div className="absolute -top-2 -right-2 bg-accent text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-md">
                      {item.step}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-text mb-3">{item.title}</h3>
                  <p className="text-text-light leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-text mb-4">What Our Customers Say</h2>
            <p className="text-lg text-text-light max-w-2xl mx-auto">
              Real experiences from real customers
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="relative bg-gradient-to-br from-background to-surface rounded-3xl p-8 hover:shadow-2xl transition-all duration-300 border border-border hover:-translate-y-2"
              >
                <div className="absolute top-6 right-8 text-6xl text-primary/10 font-serif leading-none">"</div>

                <div className="relative">
                  <StarRating rating={t.rating} />
                  <p className="text-text mt-4 mb-6 leading-relaxed italic">"{t.text}"</p>

                  <div className="flex items-center gap-4 pt-4 border-t border-border">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {t.author[0]}
                    </div>
                    <div>
                      <p className="font-bold text-text">{t.author}</p>
                      <p className="text-sm text-text-light">{t.location} • {t.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-dark to-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.05),transparent_50%)]"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-blue-200 mb-10 max-w-2xl mx-auto">
            Join thousands of happy customers and service providers on MtaaniConnect today
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/register"
              className="bg-white text-primary px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5"
            >
              Sign Up Now
            </Link>
            <Link
              to="/login"
              className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-all"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* App Download */}
      <section className="py-20 bg-gradient-to-b from-background to-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-text mb-4">Get the MtaaniConnect App</h2>
          <p className="text-lg text-text-light mb-10 max-w-xl mx-auto">
            Download now and book services on the go
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <button className="bg-gray-800 text-white px-8 py-4 rounded-xl font-semibold hover:bg-gray-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-3 border border-border">
              <span className="text-2xl">📱</span>
              <div className="text-left">
                <div className="text-xs text-gray-400">Download on</div>
                <div className="text-sm font-bold">Google Play</div>
              </div>
            </button>
            <button className="bg-gray-800 text-white px-8 py-4 rounded-xl font-semibold hover:bg-gray-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-3 border border-border">
              <span className="text-2xl">🍎</span>
              <div className="text-left">
                <div className="text-xs text-gray-400">Download on</div>
                <div className="text-sm font-bold">App Store</div>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface text-gray-300 py-16 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
              <h3 className="text-white text-2xl font-bold mb-4">MtaaniConnect</h3>
              <p className="text-sm leading-relaxed text-gray-400">Find trusted service providers near you instantly. Building stronger communities through reliable services.</p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4 text-lg">Company</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-white transition-colors text-gray-400">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors text-gray-400">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors text-gray-400">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors text-gray-400">Press</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4 text-lg">Legal</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-white transition-colors text-gray-400">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors text-gray-400">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors text-gray-400">Cookie Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4 text-lg">Follow Us</h4>
              <div className="flex space-x-4 text-3xl mb-6">
                <a href="#" className="hover:scale-110 transition-transform">📘</a>
                <a href="#" className="hover:scale-110 transition-transform">📸</a>
                <a href="#" className="hover:scale-110 transition-transform">🐦</a>
                <a href="#" className="hover:scale-110 transition-transform">💬</a>
              </div>
              <p className="text-sm text-gray-400">support@mtaaniconnect.co.ke</p>
            </div>
          </div>
          <div className="border-t border-border mt-12 pt-8 text-center text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} MtaaniConnect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
