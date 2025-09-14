const { connectDB } = require('./database');
const User = require('./models/User');
const Lead = require('./models/Lead');

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Lead.deleteMany({});
    console.log('Cleared existing data');

    // Create test user
    const testUser = new User({
      email: 'test@example.com',
      password: 'test123',
      firstName: 'Test',
      lastName: 'User'
    });

    await testUser.save();
    console.log('Test user created');

    // Sample data for leads
    const sampleLeads = [
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@company1.com',
        phone: '+1-555-0101',
        company: 'Tech Corp',
        city: 'San Francisco',
        state: 'CA',
        source: 'website',
        status: 'new',
        score: 85,
        leadValue: 5000,
        lastActivityAt: new Date('2024-01-15T10:30:00Z'),
        isQualified: true,
        user: testUser._id
      },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@company2.com',
        phone: '+1-555-0102',
        company: 'Marketing Inc',
        city: 'New York',
        state: 'NY',
        source: 'facebook_ads',
        status: 'contacted',
        score: 72,
        leadValue: 3200,
        lastActivityAt: new Date('2024-01-14T14:20:00Z'),
        isQualified: false,
        user: testUser._id
      },
      {
        firstName: 'Mike',
        lastName: 'Johnson',
        email: 'mike.johnson@company3.com',
        phone: '+1-555-0103',
        company: 'Finance LLC',
        city: 'Chicago',
        state: 'IL',
        source: 'google_ads',
        status: 'qualified',
        score: 95,
        leadValue: 8500,
        lastActivityAt: new Date('2024-01-16T09:15:00Z'),
        isQualified: true,
        user: testUser._id
      },
      {
        firstName: 'Sarah',
        lastName: 'Wilson',
        email: 'sarah.wilson@company4.com',
        phone: '+1-555-0104',
        company: 'Healthcare Systems',
        city: 'Boston',
        state: 'MA',
        source: 'referral',
        status: 'won',
        score: 88,
        leadValue: 12000,
        lastActivityAt: new Date('2024-01-13T16:45:00Z'),
        isQualified: true,
        user: testUser._id
      },
      {
        firstName: 'David',
        lastName: 'Brown',
        email: 'david.brown@company5.com',
        phone: '+1-555-0105',
        company: 'Retail Solutions',
        city: 'Austin',
        state: 'TX',
        source: 'events',
        status: 'lost',
        score: 45,
        leadValue: 2000,
        lastActivityAt: new Date('2024-01-12T11:30:00Z'),
        isQualified: false,
        user: testUser._id
      }
    ];

    // Generate more sample data
    const sources = ['website', 'facebook_ads', 'google_ads', 'referral', 'events', 'other'];
    const statuses = ['new', 'contacted', 'qualified', 'lost', 'won'];
    const cities = ['San Francisco', 'New York', 'Chicago', 'Boston', 'Austin', 'Seattle', 'Denver', 'Miami', 'Los Angeles', 'Phoenix'];
    const states = ['CA', 'NY', 'IL', 'MA', 'TX', 'WA', 'CO', 'FL', 'CA', 'AZ'];
    const companies = ['Tech Corp', 'Marketing Inc', 'Finance LLC', 'Healthcare Systems', 'Retail Solutions', 'Education Group', 'Manufacturing Co', 'Consulting Firm', 'StartupXYZ', 'Enterprise Ltd'];

    for (let i = 6; i <= 100; i++) {
      const firstName = `Lead${i}`;
      const lastName = `LastName${i}`;
      const email = `lead${i}@company${i}.com`;
      const phone = `+1-555-${String(i).padStart(4, '0')}`;
      const company = companies[Math.floor(Math.random() * companies.length)];
      const city = cities[Math.floor(Math.random() * cities.length)];
      const state = states[Math.floor(Math.random() * states.length)];
      const source = sources[Math.floor(Math.random() * sources.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const score = Math.floor(Math.random() * 101);
      const leadValue = Math.floor(Math.random() * 15000) + 500;
      const isQualified = Math.random() > 0.5;
      
      // Random date within last 30 days
      const randomDate = new Date();
      randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 30));
      const lastActivityAt = randomDate;

      sampleLeads.push({
        firstName: firstName,
        lastName: lastName,
        email: email,
        phone: phone,
        company: company,
        city: city,
        state: state,
        source: source,
        status: status,
        score: score,
        leadValue: leadValue,
        lastActivityAt: lastActivityAt,
        isQualified: isQualified,
        user: testUser._id
      });
    }

    // Insert leads
    await Lead.insertMany(sampleLeads);
    console.log(`Seeded ${sampleLeads.length} leads for test user`);
    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase().then(() => {
    process.exit(0);
  });
}

module.exports = { seedDatabase };