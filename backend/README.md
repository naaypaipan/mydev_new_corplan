

## Development
- Create your `.env` file from .env.example
- Use Database Connection String
``` 
MONGODB_URL=mongodb://
```
- App Running at Port 3001 by using command
```
    npm run dev
```
- Api Route is /api/v1

## โครงสร้างของการเขียน Lookup Aggregate Pipeline
### Blank Template
```
const methods = {
 // สำหรับการสร้าง  Aggregation ด้วยตนเอง (Lookup,Query อื่นๆ)
  createPipeline(req) {
    const pipeline = [];

    // General Case Look up Pipeline
    // ถ้าต้องการ Lookup ตัวต่อไปเขียนตรงนี้ได้เลย
    /**
     *
     */

    // แล้วเราอยากเอามาใช้เลย โดยไม่ต้องเข้าไปที่ index 0 เรากฺ็ต้อง set
    /**
     *
     */

    // Searching Query
    /**
     *
     */

    // จัดเรียง และเปลี่ยน _id เป็น id
    pipeline.push({ $sort: { createdAt: -1 } });
    pipeline.push({ $set: { id: "$_id" } });

    // ทำแบบคู่ขนานกันไป ก็คือการนับจำนวนและการ limit
    pipeline.push({
      $facet: {
        count: [{ $count: "total" }],
        data: [
          {
            $skip: +(
              (req.query.size || config.pageLimit) *
              ((req.query.page || 1) - 1)
            ),
          },
          {
            $limit: parseInt(req.query.size, 10) || config.pageLimit,
          },
        ],
      },
    });

    return { pipeline };
  },
  find(req) {
    const limit = +(req.query.size || config.pageLimit);
    return new Promise(async (resolve, reject) => {
      try {
        Promise.all([Customer.aggregate(this.createPipeline(req).pipeline)])
          .then((result) => {
            const rows = result[0][0]?.data;
            // eslint-disable-next-line prefer-const
            let queryResult = rows;

            // จัดการ Data ก่อนที่เราจะส่ง
            /**
             *
             *
             */

            const count = result[0][0]?.count?.[0]?.total;
            console.log(result);
            resolve({
              total: count,
              lastPage: Math.ceil(count / limit),
              currPage: +req.query.page || 1,
              rows: queryResult,
            });
          })
          .catch((error) => {
            reject(error);
          });
      } catch (error) {
        reject(error);
      }
    });
  }
}
```

### Full Template
```
// สำหรับการสร้าง  Aggregation ด้วยตนเอง (Lookup,Query อื่นๆ)
  createPipeline(req) {
    const pipeline = [];

    // General Case Look up Pipeline
    // ถ้าต้องการ Lookup ตัวต่อไปเขียนตรงนี้ได้เลย
    pipeline.push({
      $lookup: {
        from: "producttypes", // เปลี่ยนชื่อตารางเป็นตัวเล็ก และ รูปพหูพจน์ให้หมด
        localField: "product_type",
        foreignField: "_id",
        as: "product_type",
      },
    });

    // แล้วเราอยากเอามาใช้เลย โดยไม่ต้องเข้าไปที่ index 0 เรากฺ็ต้อง set
    pipeline.push({
      $set: { product_type: { $arrayElemAt: ["$product_type", 0] } },
    });

    // Searching Query
    if (req.query.name) {
      pipeline.push({
        $match: {
          name: {
            $regex: req.query.name,
          },
        },
      });
    }

    if (req.query.productTypeName) {
      pipeline.push({
        $match: {
          "product_type.name": {
            $regex: req.query.productTypeName,
          },
        },
      });
    }

    if (req.query.productTypeId) {
      pipeline.push({
        $match: {
          "product_type._id": {
            $eq: mongoose.Types.ObjectId(req.query.productTypeId),
          },
        },
      });
    }

    if (req.query.typeCode) {
      pipeline.push({
        $match: {
          type_code: {
            $regex: req.query.typeCode,
          },
        },
      });
    }

    // จัดเรียง และเปลี่ยน _id เป็น id
    pipeline.push({ $sort: { createdAt: -1 } });
    pipeline.push({ $set: { id: "$_id" } });

    // ทำแบบคู่ขนานกันไป ก็คือการนับจำนวนและการ limit
    pipeline.push({
      $facet: {
        count: [{ $count: "total" }],
        data: [
          {
            $skip: +(
              (req.query.size || config.pageLimit) *
              ((req.query.page || 1) - 1)
            ),
          },
          {
            $limit: parseInt(req.query.size, 10) || config.pageLimit,
          },
        ],
      },
    });

    return { pipeline };
  },

  async find(req) {
    const limit = +(req.query.size || config.pageLimit);

    console.log(req.query);
    return new Promise(async (resolve, reject) => {
      try {
        Promise.all([Product.aggregate(this.createPipeline(req).pipeline)])
          .then((result) => {
            const rows = result[0][0]?.data;
            // eslint-disable-next-line prefer-const
            let queryResult = rows;

            // จัดการ Data ก่อนที่เราจะส่ง
            /**
             *
             */

            const count = result[0][0]?.count?.[0]?.total;
            console.log(result);
            resolve({
              total: count,
              lastPage: Math.ceil(count / limit),
              currPage: +req.query.page || 1,
              rows: queryResult,
            });
          })
          .catch((error) => {
            reject(error);
          });
      } catch (error) {
        reject(error);
      }
    });
  },

```

---

## Socket.IO — Real-time Event System

ระบบ Socket.IO ใช้สำหรับ **อัปเดตข้อมูลแบบ real-time** เมื่อ Backend มีการเปลี่ยนแปลงข้อมูล (สร้าง/แก้ไข/ลบ) จะ broadcast event ไปยัง Frontend ทุก client ที่เชื่อมต่ออยู่ ให้หน้าจอ refresh ข้อมูลทันทีโดยไม่ต้อง reload

### สถาปัตยกรรมภาพรวม

```
User กดปุ่ม → Frontend ส่ง HTTP Request → Backend บันทึก DB
                                              ↓
                                    Backend emit Socket Event
                                              ↓
                               Frontend ทุก client รับ event
                                              ↓
                                  Frontend เรียก API ดึงข้อมูลใหม่
                                              ↓
                                     หน้าจออัปเดตทันที
```

### ไฟล์ที่เกี่ยวข้อง

#### Backend

| ไฟล์ | หน้าที่ |
|------|---------|
| `configs/socket.js` | ตั้งค่า Socket.IO Server, export `initSocket()` + `getIO()` |
| `server.js` | สร้าง HTTP Server แล้วเรียก `initSocket(server)` |
| `services/timestamp.service.js` | Emit `timestamp:created`, `timestamp:updated`, `timestamp:deleted` |
| `services/expenses.service.js` | Emit `expenses:created`, `expenses:updated`, `expenses:deleted` |
| `services/payout.service.js` | Emit `payout:created`, `payout:updated`, `payout:deleted` |
| `services/chatExpenses.service.js` | Emit `chat:created` |

#### Frontend

| ไฟล์ | หน้าที่ |
|------|---------|
| `src/contexts/SocketContext.js` | สร้าง React Context, Provider, `useSocket()` hook |
| `src/index.js` | ครอบ App ด้วย `<SocketProvider>` |
| `src/views/Humen/HrTimestampList.js` | ฟัง `timestamp:created/updated/deleted` |
| `src/views/Finance/HrTimestampList.js` | ฟัง `timestamp:created/updated/deleted` |
| `src/views/Finance/ExpensesList.js` | ฟัง `expenses:created/updated/deleted`, `payout:created` |
| `src/views/Finance/ExpensesDetail.js` | ฟัง `expenses:updated`, `payout:*`, `chat:created` |

### Socket Events ทั้งหมด

| Service | Event Name | เมื่อไหร่ | Data |
|---------|-----------|-----------|------|
| timestamp | `timestamp:created` | Check-in สำเร็จ | `{ id }` |
| timestamp | `timestamp:updated` | Check-out / แก้ไข | `{ id }` |
| timestamp | `timestamp:deleted` | ลบ timestamp | `{ id }` |
| expenses | `expenses:created` | สร้างใบเบิก | `{ id }` |
| expenses | `expenses:updated` | แก้ไข/เปลี่ยนสถานะ | `{ id }` |
| expenses | `expenses:deleted` | ลบใบเบิก | `{ id }` |
| payout | `payout:created` | จ่ายเงิน | `{ id, expenses }` |
| payout | `payout:updated` | แก้ไขการจ่าย | `{ id }` |
| payout | `payout:deleted` | ลบการจ่าย | `{ id }` |
| chatExpenses | `chat:created` | ส่งข้อความ chat | `{ expenses_id, id }` |

### วิธีใช้งาน — Backend (Emit Event)

ใน service file ใช้ `getIO()` เพื่อดึง Socket.IO instance แล้ว emit event หลัง transaction สำเร็จ:

```js
const { getIO } = require("../configs/socket");

insert(data) {
  return new Promise(async (resolve, reject) => {
    // ... save to DB, commit transaction ...
    resolve(inserted);
  })
  // Non-blocking: emit หลัง Promise resolve
  .then((result) => {
    const io = getIO();
    if (io && result?._id) io.emit("timestamp:created", { id: result._id });
    return result;
  });
}
```

### วิธีใช้งาน — Frontend (Listen Event)

ใน React component ใช้ `useSocket()` hook แล้ว subscribe event ใน `useEffect`:

```jsx
import { useSocket } from '../../contexts/SocketContext';

const socket = useSocket();

useEffect(() => {
  if (!socket) return;
  const refresh = () => fetchData();

  socket.on('timestamp:created', refresh);
  socket.on('timestamp:updated', refresh);
  socket.on('timestamp:deleted', refresh);

  return () => {
    socket.off('timestamp:created', refresh);
    socket.off('timestamp:updated', refresh);
    socket.off('timestamp:deleted', refresh);
  };
}, [socket]);
```

### หมายเหตุ

- Socket.IO ส่งแค่ `{ id }` มากับ event — **ไม่ได้ส่งข้อมูลจริง** Frontend ต้องเรียก API ใหม่เพื่อดึงข้อมูลล่าสุด
- การ emit เป็นแบบ **broadcast** ไปยังทุก client (ไม่ได้แยก room)
- Debug ดูได้ที่ Browser Console → จะเห็น `[Socket.IO] 📩 Event: ...` ทุกครั้งที่มี event
- Backend console จะแสดง `[Socket.IO] Client connected: xxx` เมื่อมี client เชื่อมต่อ