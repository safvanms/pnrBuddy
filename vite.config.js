import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

function pnrApiPlugin() {
  return {
    name: 'pnr-api-proxy',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api/pnr')) {
          // Allow CORS
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');

          if (req.method === 'OPTIONS') {
            res.statusCode = 204;
            res.end();
            return;
          }

          // Extract PNR number
          const match = req.url.match(/\/api\/pnr\/?(\d{10})/);
          const urlObj = new URL(req.url, 'http://localhost');
          const pnr = match ? match[1] : urlObj.searchParams.get('pnr');
          const rawFormat = urlObj.searchParams.get('format') === 'raw' || urlObj.searchParams.get('format') === 'indianrail';

          if (!pnr || !/^\d{10}$/.test(pnr)) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: 'Valid 10-digit Indian Railway PNR required' }));
            return;
          }

          try {
            // Query ConfirmTkt live Indian Railways PRS gateway
            const ctUrl = `https://cttrainsapi.confirmtkt.com/api/v2/ctpro/mweb/${pnr}?querysource=ct-web&locale=en&getHighChanceText=true&livePnr=true`;
            const ctResponse = await fetch(ctUrl, {
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

            if (ctResponse.ok) {
              const ctData = await ctResponse.json();
              const pnrRes = ctData.data?.pnrResponse;

              // Check if PNR is invalid, flushed, or missing train details
              if (!pnrRes || pnrRes.error || !pnrRes.trainNo) {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  success: false,
                  pnr,
                  error: typeof pnrRes?.error === 'string' ? pnrRes.error : (pnrRes?.error?.message || 'Flushed PNR / PNR not yet generated in Indian Railways reservation database.')
                }));
                return;
              }
              
              // Build official IndianRailways JSON schema with genuine API data
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

              // If caller specifically requested pure official IndianRailways JSON format
              if (rawFormat) {
                res.end(JSON.stringify(indianRailGovJson, null, 2));
                return;
              }

              // Return enriched payload with real data and official schema
              res.end(JSON.stringify({
                success: true,
                live: true,
                pnr,
                indianRailGovData: indianRailGovJson,
                data: ctData.data
              }));
              return;
            } else {
              res.statusCode = ctResponse.status;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ 
                success: false, 
                status: ctResponse.status, 
                message: `Upstream Railway API responded with status: ${ctResponse.status}` 
              }));
              return;
            }
          } catch (err) {
            res.statusCode = 502;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: err.message }));
            return;
          }
        }
        next();
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), pnrApiPlugin()],
  server: {
    port: 5174
  }
});
