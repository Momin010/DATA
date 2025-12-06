module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const [response1, response2] = await Promise.all([
      fetch('https://tapahtumat.tampere.fi/api/collection/634844c32f41a024ee51a234/content?country=FI&hashtagsForContentSelection=&lang=fi&mode=event&sort=startDate&strictLang=true'),
      fetch('https://tapahtumat.tampere.fi/api/collection/634844c32f41a024ee51a234/content?areas=&country=FI&hashtagsForContentSelection=&lang=fi&mode=event&sort=countViews&strictLang=true')
    ]);

    if (!response1.ok || !response2.ok) {
      throw new Error('Failed to fetch from API');
    }

    const data1 = await response1.json();
    const data2 = await response2.json();

    // Limit to first 10 from each
    const events1 = Array.isArray(data1) ? data1.slice(0, 10) : [];
    const events2 = Array.isArray(data2) ? data2.slice(0, 10) : [];

    // Combine
    const allEvents = [...events1, ...events2];

    // Clean and structure the data
    const cleanedEvents = allEvents.map(event => ({
      title: event.title || event.name || 'No Title',
      description: event.description || event.short_description || 'No Description',
      startDate: event.start_date || event.startDate || event.event_dates?.start || 'Unknown',
      endDate: event.end_date || event.endDate || event.event_dates?.end || 'Unknown',
      location: event.location || event.venue || 'Unknown',
      url: event.url || event.link || ''
    }));

    res.status(200).json(cleanedEvents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
}