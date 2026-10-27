// Standalone Node.js PNR API Server for pnrBuddy
// Connects to Indian Railways / ConfirmTkt and serves official indianrail.gov.in schema
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || process.argv[2] || 5000;

const server = http.createServer(async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  // API Route: /api/pnr/:pnr or /api/pnr?pnr=...
  if (req.url.startsWith('/api/pnr')) {
    const match = req.url.match(/\/api\/pnr\/?(\d{10})/);
    const urlObj = new URL(req.url, `http://localhost:${PORT}`);
    const pnr = match ? match[1] : urlObj.searchParams.get('pnr');
    const rawFormat = urlObj.searchParams.get('format') === 'raw' || urlObj.searchParams.get('format') === 'indianrail';

    if (!pnr || !/^\d{10}$/.test(pnr)) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ 
        success: false, 
        error: 'Valid 10-digit Indian Railway PNR number is required.' 
      }));
      return;
    }

    try {
      const ctUrl = `https://cttrainsapi.confirmtkt.com/api/v2/ctpro/mweb/${pnr}?querysource=ct-web&locale=en&getHighChanceText=true&livePnr=true`;
      const ctRes = await fetch(ctUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Origin': 'https://www.confirmtkt.com',
          'Referer': 'https://www.confirmtkt.com/'
        },
        body: JSON.stringify({
          proPlanName: 'CP7',
          emailId: '',
          tempToken: ''
        })
      });

      if (ctRes.ok) {
        const json = await ctRes.json();
        const pnrRes = json.data?.pnrResponse;

        if (!pnrRes || pnrRes.error || !pnrRes.trainNo) {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ 
            success: false, 
            pnr,
            error: pnrRes?.error || 'Flushed PNR / PNR not yet generated in Indian Railways reservation database.' 
          }));
          return;
        }

        const now = new Date();
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const dateOfJourney = pnrRes.doj ? `${pnrRes.doj} ${pnrRes.departureTime || ''}`.trim() : '';

        const passengerList = (pnrRes.passengerStatus || []).map((p, idx) => {
          const bStatus = p.bookingStatus || p.bookingStatusNew || p.currentStatus || 'WL';
          const bBerth = p.bookingBerthNo || p.berth || '--';
          const cStatus = p.currentStatus || p.currentStatusNew || 'WL';
          const cBerth = p.currentBerthNo || p.berth || '--';

          return {
            passengerSerialNumber: p.number || idx + 1,
            concessionOpted: false,
            forGoConcessionOpted: false,
            passengerIcardFlag: false,
            childBerthFlag: false,
            passengerNationality: 'IN',
            passengerQuota: p.bookingStatus?.includes('RL') ? 'RL' : (pnrRes.quota || 'GN'),
            passengerCoachPosition: p.coachPosition || 0,
            waitListType: 0,
            bookingStatusIndex: 0,
            bookingStatus: (bStatus || '').replace(/\s+/g, ' ').trim(),
            bookingCoachId: p.bookingCoachId || p.coach || '',
            bookingBerthNo: bBerth,
            bookingStatusDetails: p.bookingStatusDetails || (p.bookingCoachId && bBerth !== '--' ? `${(bStatus || '').replace(/\s+/g, ' ').trim()}/${p.bookingCoachId}/${bBerth}` : (bStatus || '').replace(/\s+/g, ' ').trim()),
            currentStatusIndex: 0,
            currentStatus: (cStatus || '').replace(/\s+/g, ' ').trim(),
            currentCoachId: p.currentCoachId || p.coach || '',
            currentBerthNo: cBerth,
            currentStatusDetails: p.currentStatusDetails || (p.currentCoachId && cBerth !== '--' ? `${(cStatus || '').replace(/\s+/g, ' ').trim()}/${p.currentCoachId}/${cBerth}` : (cStatus || '').replace(/\s+/g, ' ').trim()),
            prediction: p.prediction || '',
            predictionPercentage: p.predictionPercentage || 0,
            confirmTktStatus: p.confirmTktStatus || ''
          };
        });

        const indianRailGovJson = {
          pnrNumber: pnrRes.pnr || pnr,
          dateOfJourney: dateOfJourney,
          trainNumber: pnrRes.trainNo,
          trainName: pnrRes.trainName,
          sourceStation: pnrRes.from,
          destinationStation: pnrRes.to,
          reservationUpto: pnrRes.reservationUpto || pnrRes.to,
          boardingPoint: pnrRes.boardingPoint || pnrRes.from,
          journeyClass: pnrRes.class,
          numberOfpassenger: pnrRes.passengerCount || passengerList.length,
          chartStatus: pnrRes.chartPrepared ? 'Chart Prepared' : 'Chart Not Prepared',
          informationMessage: pnrRes.informationMessage || [''],
          passengerList: passengerList,
          serverId: 'CRIS-PRS-NDLS-01',
          timeStamp: `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()} ${now.toLocaleTimeString()}`,
          bookingFare: parseInt(pnrRes.bookingFare, 10) || parseInt(pnrRes.ticketFare, 10) || 0,
          ticketFare: parseInt(pnrRes.ticketFare, 10) || 0,
          quota: pnrRes.quota || 'GN',
          reasonType: 'S',
          ticketTypeInPrs: 'E',
          vikalpStatus: pnrRes.optVikalp ? 'Yes' : 'No',
          waitListType: 0,
          bookingDate: pnrRes.bookingDate || '',
          arrivalDate: pnrRes.destinationDoj ? `${pnrRes.destinationDoj} ${pnrRes.arrivalTime || ''}`.trim() : '',
          distance: pnrRes.distance || null,
          isWL: pnrRes.passengerStatus?.[0]?.currentStatus?.includes('WL') ? 'Y' : 'N'
        };

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');

        if (rawFormat) {
          res.end(JSON.stringify(indianRailGovJson, null, 2));
          return;
        }

        res.end(JSON.stringify({
          success: true,
          live: true,
          pnr,
          indianRailGovData: indianRailGovJson,
          data: json.data
        }));
      } else {
        res.statusCode = ctRes.status;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          success: false,
          status: ctRes.status,
          message: `Upstream Railway API responded with status ${ctRes.status}`
        }));
      }
    } catch (err) {
      res.statusCode = 502;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        error: err.message
      }));
    }
    return;
  }

  // Health check
  if (req.url === '/health') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ status: 'ok', service: 'pnrBuddy IndianRail Gateway' }));
    return;
  }

  res.statusCode = 404;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ error: 'Endpoint not found. Use /api/pnr/:pnr or /api/pnr/:pnr?format=raw' }));
});

server.listen(PORT, () => {
  console.log(`🚂 pnrBuddy API listening at http://localhost:${PORT}`);
  console.log(`📡 Try: http://localhost:${PORT}/api/pnr/4146937169?format=raw`);
});
