require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();

app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
);

const TABLE = "document_tracking";

// ==========================
// GET ALL
// ==========================
app.get("/documents", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .order("id", { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

// ==========================
// GET BY ID
// ==========================
app.get("/documents/:id", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

// ==========================
// GET BY UID
// ==========================
app.get("/documents/uid/:uid", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .eq("uid", req.params.uid);

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

// ==========================
// CREATE
// ==========================
app.post("/documents", async (req, res) => {
  try {
    const {
      uid,
      record_datetime,
      doc_number,
      doc_date,
      department,
      officer_name,
      subject,
      phone_number,
      status,
      drive_link,
      remarks,
      processing_at,
      completed_at,
      rejected_at, // เพิ่ม field นี้
    } = req.body;

    const { data, error } = await supabase
      .from(TABLE)
      .insert([
        {
          uid,
          record_datetime,
          doc_number,
          doc_date,
          department,
          officer_name,
          subject,
          phone_number,
          status,
          drive_link,
          remarks,
          processing_at,
          completed_at,
          rejected_at, // เพิ่ม field นี้
        },
      ])
      .select();

    if (error) throw error;

    res.status(201).json(data);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
});

// ==========================
// UPDATE
// ==========================
app.put("/documents/:id", async (req, res) => {
  try {
    const updateData = {
      ...req.body,
    };

    // ถ้า status = REJECTED และไม่มี rejected_at
    // ให้ set เวลาอัตโนมัติ
    if (updateData.status === "REJECTED" && !updateData.rejected_at) {
      updateData.rejected_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from(TABLE)
      .update(updateData)
      .eq("id", req.params.id)
      .select();

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
});

// ==========================
// DELETE
// ==========================
app.delete("/documents/:id", async (req, res) => {
  try {
    const { error } = await supabase
      .from(TABLE)
      .delete()
      .eq("id", req.params.id);

    if (error) throw error;

    res.json({
      message: "Deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

// ==========================
// START SERVER
// ==========================
app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
