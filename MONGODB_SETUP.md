# How to Setup MongoDB Atlas for BookMyStay

Follow these steps to get your free MongoDB Database URL.

## 1. Create an Account
1.  Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register).
2.  Sign up for a free account (or log in).

## 2. Deploy a Free Cluster
1.  After logging in, click **+ Create**.
2.  Select the **M0 Shared (Free)** tier.
3.  Choose a provider (AWS) and a region close to you.
4.  Click **Create Deployment**.

## 3. Create a Database User
1.  You will be prompted to set up security.
2.  **Username**: `admin` (or your choice).
3.  **Password**: Generat a secure password (e.g., `BookMyStay123!`). **SAVE THIS!**
4.  Click **Create Database User**.

## 4. Allow Network Access
1.  Scroll down to "Network Access".
2.  Click **Add IP Address**.
3.  Select **Allow Access from Anywhere** (0.0.0.0/0).
    *   *Note: For production, you would only allow your server IP, but for development, this is easiest.*
4.  Click **Confirm**.

## 5. Get Connection String
1.  On your dashboard, click **Connect** on your cluster.
2.  Select **Drivers**.
3.  Ensure **Node.js** is selected.
4.  Copy the connection string. It looks like:
    `mongodb+srv://admin:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority`

## 6. Configure Your Project
1.  Open the file: `backend/.env` (Create it if it doesn't exist, using `.env.example` as a template).
2.  Paste your connection string into `DATABASE_URL`.
3.  **Crucial**: Replace `<password>` with the actual password you created in Step 3.
4.  Save the file.

## 7. Run Database Sync
In your terminal, inside the `backend` folder, run:
```bash
npx prisma db push
```
This will create the collections (User, Hotel, etc.) in your new database.
