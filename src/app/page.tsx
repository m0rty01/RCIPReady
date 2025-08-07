import Image from 'next/image';
import Link from 'next/link';
import Card from '@/components/ui/Card';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-indigo-700 dark:bg-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Your Path to Canadian Immigration
            </h1>
            <p className="mt-6 text-xl text-indigo-100 max-w-3xl mx-auto">
              Navigate the Rural and Northern Immigration Pilot program with confidence.
              Find eligible jobs, validate documents, and track your progress.
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Link href="/jobs" className="transform hover:scale-105 transition-transform">
            <Card className="h-full">
              <div className="text-center">
                <div className="h-12 w-12 mx-auto mb-4">
                  <Image src="/file.svg" alt="Jobs" width={48} height={48} className="dark:invert" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Job Search</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Find RCIP-eligible jobs and connect with verified employers
                </p>
              </div>
            </Card>
          </Link>

          <Link href="/documents" className="transform hover:scale-105 transition-transform">
            <Card className="h-full">
              <div className="text-center">
                <div className="h-12 w-12 mx-auto mb-4">
                  <Image src="/file.svg" alt="Documents" width={48} height={48} className="dark:invert" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Document Validation</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Ensure your documents meet RCIP requirements
                </p>
              </div>
            </Card>
          </Link>

          <Link href="/communities" className="transform hover:scale-105 transition-transform">
            <Card className="h-full">
              <div className="text-center">
                <div className="h-12 w-12 mx-auto mb-4">
                  <Image src="/globe.svg" alt="Communities" width={48} height={48} className="dark:invert" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Communities</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Discover the perfect RCIP community for you
                </p>
              </div>
            </Card>
          </Link>

          <Link href="/process" className="transform hover:scale-105 transition-transform">
            <Card className="h-full">
              <div className="text-center">
                <div className="h-12 w-12 mx-auto mb-4">
                  <Image src="/file.svg" alt="Process" width={48} height={48} className="dark:invert" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Process Tracking</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Track your immigration journey step by step
                </p>
              </div>
            </Card>
          </Link>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-100 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Ready to Start Your Journey?
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Create your profile now and get personalized recommendations for jobs,
              communities, and step-by-step guidance through the RCIP process.
            </p>
            <div className="mt-8">
              <Link
                href="/process"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}