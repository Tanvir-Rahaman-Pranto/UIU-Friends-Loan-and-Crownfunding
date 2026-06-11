// ============================================================
//  marketplacescript.js  –  UIU Verification & Bidding Redesign
// ============================================================

var currentSelectedRequestId = null;

// ---- Helper to display trust score as stars ----
function getTrustStars(trust) {
    var rating = Math.round(trust / 20);
    var stars = '';
    for (var i = 0; i < 5; i++) {
        stars += i < rating ? '★' : '☆';
    }
    return stars;
}

// ---- Setup Shared State and Initial Data in localStorage ----
function initLocalStorageData() {
    var reqs = localStorage.getItem('loanRequests');
    if (!reqs) {
        var defaultRequests = [
            {
                id: 1,
                borrowerName: "Arif Mahmud",
                borrowerAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuB0Buzlxi6NinOKFRalj6ssvUcY9FC0MVSwkqj8ZZFfORYX2RbnaHImruUaidbuu-NhF7V_N95HvOhiloKI_z6HoFGN93jxJn9Nfg_SnA008DteAEJT8gDaGzYmoIkzESUTDgUaCgea6nZ7M-Ey8YMuG3sKVRbyWzBG0SpOLBZrbcLrTm2HPkBM81DH_TusvDxGVZsSHvCxxGdSY_FXKfHhiu5gI7oacGDXgahmFY5PAJWh63xhZ9DrUvRgaiYZ7kVameZNq3TWxx--",
                borrowerDept: "Final Year, CSE",
                title: "Final Semester Tuition Assist",
                amount: 15000,
                purpose: "Tuition Fee",
                duration: "3 Months",
                reason: "Need help with final semester tuition. Willing to pay back in installments.",
                trust: 92,
                email: "arif@bscse.uiu.ac.bd",
                isUserRequest: false,
                status: "Pending",
                expiryDays: 2
            },
            {
                id: 2,
                borrowerName: "Samia Akter",
                borrowerAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCEufTj-UrRbc38L3-nw7bkTOnlmdbKmWIRQOBzPsvMH2JxXii2Imle2O4xXFXkUpW8S-ECZolcDxM9dSc5BUX0uAnj9EfjhTVQRqYdQjlVikgLEZkKZ6G-54Mx5sQWDFLdzEIJSf2xFcq4lYQh2ZCFOFTyJAuB3R1qzD7s2Qw1mq07zLvPNdUuSOd8Jcjeb0aa0VgvbUpC9RVtkT6c7zSekNmGC7aQFb9UJ6rhseC3kbLou3DywCgEwi_zMRbdRPVFcTyRZ5rYuxFe",
                borrowerDept: "Batch 191, CSE",
                title: "Emergency Medical Fund",
                amount: 20000,
                purpose: "Medical Emergency",
                duration: "2 Months",
                reason: "Urgent medical checkup support needed. Need to buy medicine for post-surgery recovery.",
                trust: 75,
                email: "samia@bscse.uiu.ac.bd",
                isUserRequest: false,
                status: "Pending",
                expiryDays: 5
            },
            {
                id: 3,
                borrowerName: "Tanvir Ahmed",
                borrowerAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCWTAkCLCUj-MtvzVtA6Zc6FFOZrYHZvI4nc73BeE-M509d9-sObR5eTsYTp4_G6eaXhZITzLmJHpg-ZYY6PKKYZza36BM1721Fsz5PhLxkPdvucSNhF8SHWi-waKzgDkjYDGYfJJzLj2NJq827YgGKPjWTG9sT-ChIYLHy9IdcvU4vPNCtf5zfIMOYRTEBF4_wA9U4-M3bVJhM-mW3XOgRNOpqCDyEmWdKj-VkVzNidDmJO8BUI8JdS8F4RmNQCQodfyMmNH-IB1He",
                borrowerDept: "Batch 182, CSE",
                title: "Laptop Motherboard Repair",
                amount: 8000,
                purpose: "Laptop / Tech Repair",
                duration: "1 Month",
                reason: "My laptop motherboard is damaged and needs immediate replacement. It's my main device for CSE assignments.",
                trust: 85,
                email: "tanvir@bscse.uiu.ac.bd",
                isUserRequest: false,
                status: "Pending",
                expiryDays: 7
            },
            {
                id: 4,
                borrowerName: "Rahim Hasan",
                borrowerAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBhlCkHh5VSjaYEC53ZxE4HWA1BrQM-2YDShbY1PwUfyehiXJvzpPBhkaNNm2sqwkuOvx5WlKO26tuBAqakzZ0sMfvrK1cORstHD3xZnHkJeicyZhj9s7wcYjqUdZkWpMDysvN5Uvyb-H3QpiW476OqJMbvOopDSD2NX1IwhbZVapNTa99xu_6qeSPeuJqM8r6YlNrqkCMT2Hwvq8iUmSI8WuHNYFiQ5eDCZLkShuekguxPFeIz20F2N1Fn-6KMn0HmMPCgtXP97u8f",
                borrowerDept: "CSE Department",
                title: "Laptop Purchase Loan",
                amount: 2000,
                purpose: "Laptop Purchase",
                duration: "2 Months",
                reason: "Need a budget laptop for daily academic activities.",
                trust: 98,
                email: "rahim@bscse.uiu.ac.bd",
                isUserRequest: true,
                status: "Pending",
                expiryDays: 3
            },
            {
                id: 5,
                borrowerName: "Rahim Hasan",
                borrowerAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBhlCkHh5VSjaYEC53ZxE4HWA1BrQM-2YDShbY1PwUfyehiXJvzpPBhkaNNm2sqwkuOvx5WlKO26tuBAqakzZ0sMfvrK1cORstHD3xZnHkJeicyZhj9s7wcYjqUdZkWpMDysvN5Uvyb-H3QpiW476OqJMbvOopDSD2NX1IwhbZVapNTa99xu_6qeSPeuJqM8r6YlNrqkCMT2Hwvq8iUmSI8WuHNYFiQ5eDCZLkShuekguxPFeIz20F2N1Fn-6KMn0HmMPCgtXP97u8f",
                borrowerDept: "CSE Department",
                title: "Tuition Fee Loan",
                amount: 15000,
                purpose: "Tuition Fee",
                duration: "3 Months",
                reason: "Tuition Fee assistance",
                trust: 98,
                email: "rahim@bscse.uiu.ac.bd",
                isUserRequest: true,
                status: "Active",
                paidAmount: 5000,
                payments: [
                    { phase: 1, amount: 5000, status: "Paid", date: "OCT 1", txn: "TXN_01122345" },
                    { phase: 2, amount: 5000, status: "Due", date: "NOV 1" },
                    { phase: 3, amount: 5000, status: "Locked", date: "DEC 1" }
                ],
                expiryDays: 0
            },
            {
                id: 6,
                borrowerName: "Tanvir Ahmed",
                borrowerAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCWTAkCLCUj-MtvzVtA6Zc6FFOZrYHZvI4nc73BeE-M509d9-sObR5eTsYTp4_G6eaXhZITzLmJHpg-ZYY6PKKYZza36BM1721Fsz5PhLxkPdvucSNhF8SHWi-waKzgDkjYDGYfJJzLj2NJq827YgGKPjWTG9sT-ChIYLHy9IdcvU4vPNCtf5zfIMOYRTEBF4_wA9U4-M3bVJhM-mW3XOgRNOpqCDyEmWdKj-VkVzNidDmJO8BUI8JdS8F4RmNQCQodfyMmNH-IB1He",
                borrowerDept: "Batch 182, CSE",
                title: "Semester Tuition Support",
                amount: 20000,
                purpose: "Tuition Fee",
                duration: "3 Months",
                reason: "Semester Tuition Support",
                trust: 85,
                email: "tanvir@bscse.uiu.ac.bd",
                isUserRequest: false,
                status: "Active",
                paidAmount: 10000,
                expiryDays: 0
            },
            {
                id: 7,
                borrowerName: "Samia Akter",
                borrowerAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCEufTj-UrRbc38L3-nw7bkTOnlmdbKmWIRQOBzPsvMH2JxXii2Imle2O4xXFXkUpW8S-ECZolcDxM9dSc5BUX0uAnj9EfjhTVQRqYdQjlVikgLEZkKZ6G-54Mx5sQWDFLdzEIJSf2xFcq4lYQh2ZCFOFTyJAuB3R1qzD7s2Qw1mq07zLvPNdUuSOd8Jcjeb0aa0VgvbUpC9RVtkT6c7zSekNmGC7aQFb9UJ6rhseC3kbLou3DywCgEwi_zMRbdRPVFcTyRZ5rYuxFe",
                borrowerDept: "Batch 191, CSE",
                title: "Emergency Medical Fund",
                amount: 2000,
                purpose: "Medical",
                duration: "1 Month",
                reason: "Medical checkup support",
                trust: 75,
                email: "samia@bscse.uiu.ac.bd",
                isUserRequest: false,
                status: "Overdue",
                paidAmount: 0,
                expiryDays: 0
            },
            {
                id: 8,
                borrowerName: "Fahim Karim",
                borrowerAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDZwjhs7F2jQdJ4lo3Kknf8PJ8k3LuAdJp_t6y-ONR7UCo-8UmdUHL-ZNSZyMgkcSPCim63PSNSNboAnuEPttGmcZrwE676eCP8zChCpKSrs5qQmC0xwrk11ic9GJsIyKbwZfB9UEWwe1YZvWEr7E8HtOWNTR6lliN-YymQxnp7g9j9ff3EiBQ1BxUCrIlJKQHAZ5NFCLDjrDSAAdTvkGhQm055nu4-xmaKfRmq-l2OYD82Z6hKevAqVjwXsFWQSUiL_HB2tQm1LBUh",
                borrowerDept: "Batch 193, CSE",
                title: "Laptop Repair Loan",
                amount: 4200,
                purpose: "Laptop Repair",
                duration: "1 Month",
                reason: "Laptop repair support",
                trust: 90,
                email: "fahim@bscse.uiu.ac.bd",
                isUserRequest: false,
                status: "Completed",
                paidAmount: 4200,
                expiryDays: 0
            },
            {
                id: 9,
                borrowerName: "Nafis Iqbal",
                borrowerAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDDDfhA-t3zJXTBW_dOHN_4bppd9YuqJPlpMfPFYPSs-AyrIv8q4YnPXlRR1v1z1kGzw7-mAaSW3da_cSFH-GTMu0iuoQxTPVboiUQeK9XZX0MzxJeyFclU5nNPekg9OPMJkFyxrPWMNwCu9SAOkrSqccGkxMLutxfF92tco6FUGi_KbtZyDSqJns2a5PcV5ROv-2-LzpivO-wLucFDW9s8Q0MRRJRdftKzG-Jf-UYPQK4qIb0yOTm-cy8EmFNsRN8IMxid1ZVMyjAF",
                borrowerDept: "Batch 183, CSE",
                title: "Admission Fee Assist",
                amount: 12500,
                purpose: "Admission Fee",
                duration: "2 Months",
                reason: "Admission fee assist",
                trust: 94,
                email: "nafis@bscse.uiu.ac.bd",
                isUserRequest: false,
                status: "Completed",
                paidAmount: 12500,
                expiryDays: 0
            },
            {
                id: 10,
                borrowerName: "Rahim Hasan",
                borrowerAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBhlCkHh5VSjaYEC53ZxE4HWA1BrQM-2YDShbY1PwUfyehiXJvzpPBhkaNNm2sqwkuOvx5WlKO26tuBAqakzZ0sMfvrK1cORstHD3xZnHkJeicyZhj9s7wcYjqUdZkWpMDysvN5Uvyb-H3QpiW476OqJMbvOopDSD2NX1IwhbZVapNTa99xu_6qeSPeuJqM8r6YlNrqkCMT2Hwvq8iUmSI8WuHNYFiQ5eDCZLkShuekguxPFeIz20F2N1Fn-6KMn0HmMPCgtXP97u8f",
                borrowerDept: "CSE Department",
                title: "Library Fine Loan",
                amount: 500,
                purpose: "Library Fine",
                duration: "1 Month",
                reason: "Library fine assist",
                trust: 98,
                email: "rahim@bscse.uiu.ac.bd",
                isUserRequest: true,
                status: "Completed",
                paidAmount: 500,
                expiryDays: 0
            },
            {
                id: 11,
                borrowerName: "Rahim Hasan",
                borrowerAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBhlCkHh5VSjaYEC53ZxE4HWA1BrQM-2YDShbY1PwUfyehiXJvzpPBhkaNNm2sqwkuOvx5WlKO26tuBAqakzZ0sMfvrK1cORstHD3xZnHkJeicyZhj9s7wcYjqUdZkWpMDysvN5Uvyb-H3QpiW476OqJMbvOopDSD2NX1IwhbZVapNTa99xu_6qeSPeuJqM8r6YlNrqkCMT2Hwvq8iUmSI8WuHNYFiQ5eDCZLkShuekguxPFeIz20F2N1Fn-6KMn0HmMPCgtXP97u8f",
                borrowerDept: "CSE Department",
                title: "Workshop Registration",
                amount: 1200,
                purpose: "Workshop Registration",
                duration: "1 Month",
                reason: "Workshop registration assist",
                trust: 98,
                email: "rahim@bscse.uiu.ac.bd",
                isUserRequest: true,
                status: "Completed",
                paidAmount: 1200,
                expiryDays: 0
            }
        ];
        localStorage.setItem('loanRequests', JSON.stringify(defaultRequests));
    }

    var bids = localStorage.getItem('lenderBids');
    if (bids) {
        try {
            var parsedBids = JSON.parse(bids);
            // Migration: fill in missing duration with a default instead of wiping all bids
            var migrated = false;
            parsedBids.forEach(function(b) {
                if (!b.duration) {
                    b.duration = '3 Months';
                    migrated = true;
                }
            });
            if (migrated) {
                localStorage.setItem('lenderBids', JSON.stringify(parsedBids));
            }
        } catch(e) {
            localStorage.removeItem('lenderBids');
            bids = null;
        }
    }
    if (!bids) {
        var defaultBids = [
            {
                id: 101,
                requestId: 1,
                lenderName: "User A",
                lenderAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuD3mPK61cFhjfSlotr4Cfpkss-gVPRFMX9tRP4OSklxxDo1haV_hJ1my3yG_0hjVy103rl8GtFibBFvGC3gHLjMyz7ybBvS3EeG3Q20GpU-ZjwShMvbINFRrRNUPZ_csFZq3nRg843J4ov_tmD9JlWi2za224K2DxMOC_gdWzt9qBfiCMHkJZyfUiH6ZXw7hstzkHHl8PM1Q_u3ax3E5YQkEEMBdPPuuRg0Mj4Ob5G-QTIq1dNrsp8N8pJu4iPXuklcjbdJ01tX-tuL",
                lenderTrust: 99,
                rate: 4.5,
                duration: "3 Months",
                status: "Pending"
            },
            {
                id: 102,
                requestId: 1,
                lenderName: "User B",
                lenderAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDDDfhA-t3zJXTBW_dOHN_4bppd9YuqJPlpMfPFYPSs-AyrIv8q4YnPXlRR1v1z1kGzw7-mAaSW3da_cSFH-GTMu0iuoQxTPVboiUQeK9XZX0MzxJeyFclU5nNPekg9OPMJkFyxrPWMNwCu9SAOkrSqccGkxMLutxfF92tco6FUGi_KbtZyDSqJns2a5PcV5ROv-2-LzpivO-wLucFDW9s8Q0MRRJRdftKzG-Jf-UYPQK4qIb0yOTm-cy8EmFNsRN8IMxid1ZVMyjAF",
                lenderTrust: 85,
                rate: 4.0,
                duration: "2 Months",
                status: "Pending"
            },
            {
                id: 103,
                requestId: 2,
                lenderName: "User A",
                lenderAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuD3mPK61cFhjfSlotr4Cfpkss-gVPRFMX9tRP4OSklxxDo1haV_hJ1my3yG_0hjVy103rl8GtFibBFvGC3gHLjMyz7ybBvS3EeG3Q20GpU-ZjwShMvbINFRrRNUPZ_csFZq3nRg843J4ov_tmD9JlWi2za224K2DxMOC_gdWzt9qBfiCMHkJZyfUiH6ZXw7hstzkHHl8PM1Q_u3ax3E5YQkEEMBdPPuuRg0Mj4Ob5G-QTIq1dNrsp8N8pJu4iPXuklcjbdJ01tX-tuL",
                lenderTrust: 99,
                rate: 3.5,
                duration: "2 Months",
                status: "Pending"
            },
            {
                id: 104,
                requestId: 3,
                lenderName: "User B",
                lenderAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDDDfhA-t3zJXTBW_dOHN_4bppd9YuqJPlpMfPFYPSs-AyrIv8q4YnPXlRR1v1z1kGzw7-mAaSW3da_cSFH-GTMu0iuoQxTPVboiUQeK9XZX0MzxJeyFclU5nNPekg9OPMJkFyxrPWMNwCu9SAOkrSqccGkxMLutxfF92tco6FUGi_KbtZyDSqJns2a5PcV5ROv-2-LzpivO-wLucFDW9s8Q0MRRJRdftKzG-Jf-UYPQK4qIb0yOTm-cy8EmFNsRN8IMxid1ZVMyjAF",
                lenderTrust: 85,
                rate: 2.0,
                duration: "1 Month",
                status: "Pending"
            },
            {
                id: 201,
                requestId: 4,
                lenderName: "Nabil Istiak",
                lenderAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuD_H-kVulJcb_aSot2wJXvCs56t_y-LjWAMcdO-2t6BV0gj_pJ81G_x7JBSPKqP8I5LBxursDKckLe7_1M9DD5DCQ9eiWrGc_v3PrDSqLTAsOaE4cHR79D3jptSWokTpRHK0ibKl9S4oB_Id-8TUdNbcnpjK0V0-3DJU3EDvre-N-tmPjSGIrJkVtj_MSasva0GLwt_F-wanhB9jynL8s4g4eKmNx5uZxXKtIzTI1OhTG89bpWfPSMsVb_8uk__O8wDHOpS4kQJLT8r",
                lenderTrust: 88,
                rate: 4.2,
                duration: "2 Months",
                status: "Pending"
            },
            {
                id: 202,
                requestId: 4,
                lenderName: "Arif Mahmud",
                lenderAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuB0Buzlxi6NinOKFRalj6ssvUcY9FC0MVSwkqj8ZZFfORYX2RbnaHImruUaidbuu-NhF7V_N95HvOhiloKI_z6HoFGN93jxJn9Nfg_SnA008DteAEJT8gDaGzYmoIkzESUTDgUaCgea6nZ7M-Ey8YMuG3sKVRbyWzBG0SpOLBZrbcLrTm2HPkBM81DH_TusvDxGVZsSHvCxxGdSY_FXKfHhiu5gI7oacGDXgahmFY5PAJWh63xhZ9DrUvRgaiYZ7kVameZNq3TWxx--",
                lenderTrust: 95,
                rate: 3.8,
                duration: "3 Months",
                status: "Pending"
            },
            {
                id: 301,
                requestId: 5,
                lenderName: "Arif Mahmud",
                lenderAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuB0Buzlxi6NinOKFRalj6ssvUcY9FC0MVSwkqj8ZZFfORYX2RbnaHImruUaidbuu-NhF7V_N95HvOhiloKI_z6HoFGN93jxJn9Nfg_SnA008DteAEJT8gDaGzYmoIkzESUTDgUaCgea6nZ7M-Ey8YMuG3sKVRbyWzBG0SpOLBZrbcLrTm2HPkBM81DH_TusvDxGVZsSHvCxxGdSY_FXKfHhiu5gI7oacGDXgahmFY5PAJWh63xhZ9DrUvRgaiYZ7kVameZNq3TWxx--",
                lenderTrust: 95,
                rate: 4.0,
                duration: "3 Months",
                status: "Accepted"
            },
            {
                id: 401,
                requestId: 6,
                lenderName: "You",
                lenderAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAfPUhSeZ5NAWJpTIxUqTFpuWrRSPG5v8iSsaFP6LGAfp0TXPPjkmPecqjuATV9245VcfSFK2ymWjM5hhQ5rbCa0IaNLQgKtP3LQ2D-VYiHJUYL1saXay-w11muJHi7EW-3Su6XolW_KMBuLMHfEYg0neE7iu5hQokcfUcrr0Dix65Z-YcXaJnf6C85BH1-TktKoFtwtzNmIhesW-H4sv5tvOaC1bSVO3m7RrKZn8MRmX6OiuZ31wpZESMVxkEkaoW8gHPp_KaXRePK",
                lenderTrust: 98,
                rate: 4.5,
                duration: "3 Months",
                status: "Accepted"
            },
            {
                id: 501,
                requestId: 7,
                lenderName: "You",
                lenderAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAfPUhSeZ5NAWJpTIxUqTFpuWrRSPG5v8iSsaFP6LGAfp0TXPPjkmPecqjuATV9245VcfSFK2ymWjM5hhQ5rbCa0IaNLQgKtP3LQ2D-VYiHJUYL1saXay-w11muJHi7EW-3Su6XolW_KMBuLMHfEYg0neE7iu5hQokcfUcrr0Dix65Z-YcXaJnf6C85BH1-TktKoFtwtzNmIhesW-H4sv5tvOaC1bSVO3m7RrKZn8MRmX6OiuZ31wpZESMVxkEkaoW8gHPp_KaXRePK",
                lenderTrust: 98,
                rate: 3.5,
                duration: "1 Month",
                status: "Accepted"
            },
            {
                id: 601,
                requestId: 8,
                lenderName: "You",
                lenderAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAfPUhSeZ5NAWJpTIxUqTFpuWrRSPG5v8iSsaFP6LGAfp0TXPPjkmPecqjuATV9245VcfSFK2ymWjM5hhQ5rbCa0IaNLQgKtP3LQ2D-VYiHJUYL1saXay-w11muJHi7EW-3Su6XolW_KMBuLMHfEYg0neE7iu5hQokcfUcrr0Dix65Z-YcXaJnf6C85BH1-TktKoFtwtzNmIhesW-H4sv5tvOaC1bSVO3m7RrKZn8MRmX6OiuZ31wpZESMVxkEkaoW8gHPp_KaXRePK",
                lenderTrust: 98,
                rate: 4.0,
                duration: "1 Month",
                status: "Accepted"
            },
            {
                id: 701,
                requestId: 9,
                lenderName: "You",
                lenderAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAfPUhSeZ5NAWJpTIxUqTFpuWrRSPG5v8iSsaFP6LGAfp0TXPPjkmPecqjuATV9245VcfSFK2ymWjM5hhQ5rbCa0IaNLQgKtP3LQ2D-VYiHJUYL1saXay-w11muJHi7EW-3Su6XolW_KMBuLMHfEYg0neE7iu5hQokcfUcrr0Dix65Z-YcXaJnf6C85BH1-TktKoFtwtzNmIhesW-H4sv5tvOaC1bSVO3m7RrKZn8MRmX6OiuZ31wpZESMVxkEkaoW8gHPp_KaXRePK",
                lenderTrust: 98,
                rate: 4.0,
                duration: "2 Months",
                status: "Accepted"
            },
            {
                id: 801,
                requestId: 10,
                lenderName: "User A",
                lenderAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuD3mPK61cFhjfSlotr4Cfpkss-gVPRFMX9tRP4OSklxxDo1haV_hJ1my3yG_0hjVy103rl8GtFibBFvGC3gHLjMyz7ybBvS3EeG3Q20GpU-ZjwShMvbINFRrRNUPZ_csFZq3nRg843J4ov_tmD9JlWi2za224K2DxMOC_gdWzt9qBfiCMHkJZyfUiH6ZXw7hstzkHHl8PM1Q_u3ax3E5YQkEEMBdPPuuRg0Mj4Ob5G-QTIq1dNrsp8N8pJu4iPXuklcjbdJ01tX-tuL",
                lenderTrust: 99,
                rate: 3.0,
                duration: "1 Month",
                status: "Accepted"
            },
            {
                id: 901,
                requestId: 11,
                lenderName: "User B",
                lenderAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDDDfhA-t3zJXTBW_dOHN_4bppd9YuqJPlpMfPFYPSs-AyrIv8q4YnPXlRR1v1z1kGzw7-mAaSW3da_cSFH-GTMu0iuoQxTPVboiUQeK9XZX0MzxJeyFclU5nNPekg9OPMJkFyxrPWMNwCu9SAOkrSqccGkxMLutxfF92tco6FUGi_KbtZyDSqJns2a5PcV5ROv-2-LzpivO-wLucFDW9s8Q0MRRJRdftKzG-Jf-UYPQK4qIb0yOTm-cy8EmFNsRN8IMxid1ZVMyjAF",
                lenderTrust: 85,
                rate: 3.5,
                duration: "1 Month",
                status: "Accepted"
            }
        ];
        localStorage.setItem('lenderBids', JSON.stringify(defaultBids));
    }
}

// ---- Page Init ----
document.addEventListener('DOMContentLoaded', function () {
    initLocalStorageData();
    renderLoanCards();
    updateVerificationBadge();

    // Check for direct view parameter
    var urlParams = new URLSearchParams(window.location.search);
    var viewLoanId = urlParams.get('view-loan');
    if (viewLoanId) {
        viewLoanDetails(parseInt(viewLoanId));
    }

    // Escape key closes any open modal
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeLoanDetailsModal();
            closeMpVerificationModal();
            closeLoanModal();
        }
    });
});

// ---- Update verification badge in the header ----
function updateVerificationBadge() {
    var badge = document.getElementById('mp-verification-badge');
    if (!badge) return;
    if (localStorage.getItem('uiu_verified') === 'true') {
        badge.textContent = '✔ Verified CSE Student';
        badge.className = 'mp-badge verified';
    } else {
        badge.textContent = '⚠ Unverified';
        badge.className = 'mp-badge unverified';
    }
}

// ---- Render All Loan Request Cards dynamically ----
function renderLoanCards() {
    var container = document.getElementById('loan-cards-container');
    if (!container) return;

    var requests = JSON.parse(localStorage.getItem('loanRequests') || '[]');
    // Filter to show only Pending requests in the marketplace, excluding the user's own requests
    var pendingReqs = requests.filter(function(r) { return r.status === 'Pending' && !r.isUserRequest; });

    if (pendingReqs.length === 0) {
        container.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding:40px; color:#64748b;">No active loan requests in the marketplace.</div>';
        return;
    }

    var html = '';
    pendingReqs.forEach(function (req) {
        html += 
        '<div class="collapsed-card dynamic-card" style="opacity: 1;">' +
            '<div class="collapsed-inner">' +
                '<div class="collapsed-user">' +
                    '<div class="collapsed-avatar">' +
                        '<img src="' + req.borrowerAvatar + '" alt="' + req.borrowerName + '">' +
                    '</div>' +
                    '<div>' +
                        '<h3 class="collapsed-name" style="font-size:16px; font-weight:700; color:#1e293b; margin:0;">' + req.title + '</h3>' +
                        '<div style="display:flex; align-items:center; gap:8px; margin-top:4px;">' +
                            '<span style="font-size:12px; color:#475569; font-weight:600;">' + req.borrowerName + '</span>' +
                            '<span style="font-size:11px; color:#eab308; letter-spacing:0.5px;">' + getTrustStars(req.trust) + '</span>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="collapsed-details" style="display:flex; align-items:center; gap:20px;">' +
                    '<div class="collapsed-terms" style="text-align:right;">' +
                        '<p class="collapsed-max-int" style="font-size:16px; font-weight:900; color:#1E3A8A; margin:0;">' + req.amount.toLocaleString() + ' BDT</p>' +
                        '<p class="collapsed-duration" style="font-size:11px; color:#94a3b8; font-weight:600; margin:2px 0 0;">' + req.duration + ' term</p>' +
                    '</div>' +
                    '<button type="button" class="request-btn" style="padding:6px 14px; font-size:12px; border-radius:8px;" onclick="viewLoanDetails(' + req.id + ')">View Details</button>' +
                '</div>' +
            '</div>' +
            '<p style="font-size:13px; color:#64748b; line-height:1.5; margin:12px 0 0; border-top:1px solid #f1f5f9; padding-top:8px;">' + 
                (req.reason.length > 120 ? req.reason.substring(0, 120) + '...' : req.reason) + 
            '</p>' +
        '</div>';
    });

    container.innerHTML = html;
}

// ---- View Loan Details Modal ----
function viewLoanDetails(id) {
    currentSelectedRequestId = id;
    var requests = JSON.parse(localStorage.getItem('loanRequests') || '[]');
    var req = requests.find(function (r) { return r.id === id; });
    if (!req) return;

    // Populating modal fields
    document.getElementById('det-modal-ref').textContent = 'Ref ID: UIU-L-2023-' + req.id;
    document.getElementById('det-borrower-avatar').src = req.borrowerAvatar;
    document.getElementById('det-borrower-name').textContent = req.borrowerName;
    document.getElementById('det-borrower-dept').textContent = req.borrowerDept || 'UIU Student';
    document.getElementById('det-amount').textContent = req.amount.toLocaleString() + ' BDT';
    document.getElementById('det-duration').textContent = req.duration;
    document.getElementById('det-trust').textContent = getTrustStars(req.trust);
    document.getElementById('det-purpose').textContent = req.purpose;
    document.getElementById('det-reason').textContent = req.reason;

    // Load and render bids privately
    renderDetailsBids(id);

    // Open Modal
    var modal = document.getElementById('loan-details-modal');
    if (modal) {
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }
}

function closeLoanDetailsModal() {
    var modal = document.getElementById('loan-details-modal');
    if (modal) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
        document.getElementById('detBidAmountInput').value = '';
    }
}

// ---- Render Bids inside Details Modal ----
function renderDetailsBids(reqId) {
    var listContainer = document.getElementById('det-bids-list');
    var bidCountEl = document.getElementById('det-bid-count');
    if (!listContainer) return;

    var bids = JSON.parse(localStorage.getItem('lenderBids') || '[]');
    var filteredBids = bids.filter(function (b) { return b.requestId === reqId; });

    bidCountEl.textContent = filteredBids.length;

    if (filteredBids.length === 0) {
        listContainer.innerHTML = '<p style="font-size:12px; color:#94a3b8; text-align:center; padding:12px; margin:0;">No bids received yet. Be the first to offer!</p>';
        return;
    }

    var html = '';
    filteredBids.forEach(function (bid) {
        var durationText = bid.duration ? 'Offer: ' + bid.duration : '';
        html += 
        '<div class="offer-item" style="display:flex; justify-content:space-between; align-items:center; padding:10px 14px; background:#f8fafc; border-radius:10px; border:1px solid #e2e8f0; margin-bottom:6px;">' +
            '<div class="offer-user" style="display:flex; align-items:center; gap:10px;">' +
                '<img src="' + bid.lenderAvatar + '" style="width:28px; height:28px; border-radius:50%; object-fit:cover;" alt="' + bid.lenderName + '">' +
                '<div>' +
                    '<span style="font-size:13px; font-weight:700; color:#1e293b;">' + bid.lenderName + '</span>' +
                    '<span style="font-size:10px; color:#eab308; margin-left:6px;">' + getTrustStars(bid.lenderTrust) + '</span>' +
                '</div>' +
            '</div>' +
            '<div style="display:flex; flex-direction:column; align-items:flex-end; gap:2px;">' +
                '<span class="mp-badge verified" style="font-size:10px; padding:2px 8px;">✔ Verified Lender</span>' +
                (durationText ? '<span style="font-size:10px; color:#64748b; font-weight:600;">' + durationText + '</span>' : '') +
            '</div>' +
        '</div>';
    });

    listContainer.innerHTML = html;
}

// ---- Submit Lender Bid / Private Offer ----
function submitLenderBid() {
    if (localStorage.getItem('uiu_verified') !== 'true') {
        closeLoanDetailsModal();
        openVerificationModal();
        return;
    }

    var bidInput = document.getElementById('detBidAmountInput');
    var bidValue = parseFloat(bidInput.value);
    
    var durationInput = document.getElementById('detBidDurationInput');
    var durationVal = parseInt(durationInput.value) || 3;

    if (isNaN(bidValue) || bidValue <= 0 || bidValue > 20) {
        alert('Please enter a valid interest rate between 0.1% and 20%.');
        return;
    }

    var bids = JSON.parse(localStorage.getItem('lenderBids') || '[]');
    var newBid = {
        id: Date.now(),
        requestId: currentSelectedRequestId,
        lenderName: "You",
        lenderAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAfPUhSeZ5NAWJpTIxUqTFpuWrRSPG5v8iSsaFP6LGAfp0TXPPjkmPecqjuATV9245VcfSFK2ymWjM5hhQ5rbCa0IaNLQgKtP3LQ2D-VYiHJUYL1saXay-w11muJHi7EW-3Su6XolW_KMBuLMHfEYg0neE7iu5hQokcfUcrr0Dix65Z-YcXaJnf6C85BH1-TktKoFtwtzNmIhesW-H4sv5tvOaC1bSVO3m7RrKZn8MRmX6OiuZ31wpZESMVxkEkaoW8gHPp_KaXRePK",
        lenderTrust: 98,
        rate: bidValue,
        duration: durationVal + " Month" + (durationVal > 1 ? "s" : ""),
        status: "Pending"
    };

    bids.push(newBid);
    localStorage.setItem('lenderBids', JSON.stringify(bids));

    // Re-render Bidders list inside details modal
    renderDetailsBids(currentSelectedRequestId);

    showToast('✅ Your private bid of ' + bidValue + '% has been submitted successfully.');
    bidInput.value = '';
    if (durationInput) durationInput.value = '3';
}

// ---- Open verification modal ----
function openVerificationModal() {
    var modal = document.getElementById('mp-verification-modal');
    if (modal) {
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }
}

function closeMpVerificationModal() {
    var modal = document.getElementById('mp-verification-modal');
    if (modal) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
    }
}

function submitMpVerification() {
    var studentId = document.getElementById('mp-student-id').value.trim();
    var studentEmail = document.getElementById('mp-student-email').value.trim();

    if (!studentId) {
        alert('Please enter your UIU Student ID.');
        return;
    }
    // Validation Rule: email must end with @bscse.uiu.ac.bd
    if (!studentEmail || !studentEmail.endsWith('@bscse.uiu.ac.bd')) {
        alert('Validation Error: Institutional email must end strictly with @bscse.uiu.ac.bd');
        return;
    }

    localStorage.setItem('uiu_verified', 'true');
    localStorage.setItem('uiu_student_id', studentId);
    localStorage.setItem('uiu_student_email', studentEmail);

    closeMpVerificationModal();
    updateVerificationBadge();
    showToast('✅ UIU identity verified! You can now request loans and bid.');
}

// ---- Request a Loan Modal Control ----
function requestLoan() {
    if (localStorage.getItem('uiu_verified') !== 'true') {
        openVerificationModal();
        return;
    }
    var overlay = document.getElementById('loan-modal-overlay');
    if (overlay) {
        overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
        updateLoanSummary();
    }
}

function closeLoanModal() {
    var overlay = document.getElementById('loan-modal-overlay');
    if (overlay) {
        overlay.classList.remove('open');
        document.body.style.overflow = '';
    }
}

// Close loan modal when clicking outside the modal box
function handleOverlayClick(event) {
    var box = document.getElementById('loan-modal-box');
    if (box && !box.contains(event.target)) {
        closeLoanModal();
    }
}

// Close verification modal when clicking outside the modal box
function handleMpVerificationOverlayClick(event) {
    var box = document.querySelector('#mp-verification-modal .mp-modal-box');
    if (box && !box.contains(event.target)) {
        closeMpVerificationModal();
    }
}

// Close details modal when clicking outside the modal box
function handleDetailsOverlayClick(event) {
    var box = document.querySelector('#loan-details-modal .mp-modal-box');
    if (box && !box.contains(event.target)) {
        closeLoanDetailsModal();
    }
}

// ---- Submit Loan Request ----
function submitLoanRequest() {
    var agree  = document.getElementById('m-agree-check');
    var amount = document.getElementById('m-loan-amount');
    var purpose = document.getElementById('m-loan-purpose').value;
    var duration = document.getElementById('m-loan-duration').value;
    var reason = document.getElementById('m-loan-reason');
    var btn    = document.getElementById('loan-submit-btn');

    if (!agree.checked) {
        alert('Please agree to the repayment terms before posting your request.');
        return;
    }
    if (!amount.value || isNaN(amount.value) || parseInt(amount.value) <= 0) {
        alert('Please enter a valid loan amount.');
        amount.focus();
        return;
    }
    if (!reason.value.trim()) {
        alert('Please explain why you need this loan.');
        reason.focus();
        return;
    }

    btn.textContent = '✓ Posted!';
    btn.style.background = '#10b981';

    // Build loan request object
    var requests = JSON.parse(localStorage.getItem('loanRequests') || '[]');
    var newRequest = {
        id: Date.now(),
        borrowerName: "Rahim Hasan",
        borrowerAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBhlCkHh5VSjaYEC53ZxE4HWA1BrQM-2YDShbY1PwUfyehiXJvzpPBhkaNNm2sqwkuOvx5WlKO26tuBAqakzZ0sMfvrK1cORstHD3xZnHkJeicyZhj9s7wcYjqUdZkWpMDysvN5Uvyb-H3QpiW476OqJMbvOopDSD2NX1IwhbZVapNTa99xu_6qeSPeuJqM8r6YlNrqkCMT2Hwvq8iUmSI8WuHNYFiQ5eDCZLkShuekguxPFeIz20F2N1Fn-6KMn0HmMPCgtXP97u8f",
        borrowerDept: "CSE Department",
        title: purpose + " Assistance Request",
        amount: parseInt(amount.value),
        purpose: purpose,
        duration: duration,
        reason: reason.value.trim(),
        trust: 98,
        email: localStorage.getItem('uiu_student_email') || "rahim@bscse.uiu.ac.bd",
        isUserRequest: true, // User request flag
        status: "Pending",
        expiryDays: 3
    };

    requests.push(newRequest);
    localStorage.setItem('loanRequests', JSON.stringify(requests));

    // Pre-populate 2 mock bids for this request so the user has bids to privately compare
    var bids = JSON.parse(localStorage.getItem('lenderBids') || '[]');
    var mockBid1 = {
        id: Date.now() + 1,
        requestId: newRequest.id,
        lenderName: "Nabil Istiak",
        lenderAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuD_H-kVulJcb_aSot2wJXvCs56t_y-LjWAMcdO-2t6BV0gj_pJ81G_x7JBSPKqP8I5LBxursDKckLe7_1M9DD5DCQ9eiWrGc_v3PrDSqLTAsOaE4cHR79D3jptSWokTpRHK0ibKl9S4oB_Id-8TUdNbcnpjK0V0-3DJU3EDvre-N-tmPjSGIrJkVtj_MSasva0GLwt_F-wanhB9jynL8s4g4eKmNx5uZxXKtIzTI1OhTG89bpWfPSMsVb_8uk__O8wDHOpS4kQJLT8r",
        lenderTrust: 88,
        rate: 3.8,
        duration: "2 Months",
        status: "Pending"
    };
    var mockBid2 = {
        id: Date.now() + 2,
        requestId: newRequest.id,
        lenderName: "Fahim Ahmed",
        lenderAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDZwjhs7F2jQdJ4lo3Kknf8PJ8k3LuAdJp_t6y-ONR7UCo-8UmdUHL-ZNSZyMgkcSPCim63PSNSNboAnuEPttGmcZrwE676eCP8zChCpKSrs5qQmC0xwrk11ic9GJsIyKbwZfB9UEWwe1YZvWEr7E8HtOWNTR6lliN-YymQxnp7g9j9ff3EiBQ1BxUCrIlJKQHAZ5NFCLDjrDSAAdTvkGhQm055nu4-xmaKfRmq-l2OYD82Z6hKevAqVjwXsFWQSUiL_HB2tQm1LBUh",
        lenderTrust: 95,
        rate: 4.2,
        duration: "3 Months",
        status: "Pending"
    };
    bids.push(mockBid1);
    bids.push(mockBid2);
    localStorage.setItem('lenderBids', JSON.stringify(bids));

    setTimeout(function () {
        // Reset form
        amount.value = '';
        reason.value = '';
        agree.checked = false;
        btn.textContent = 'Post Loan Request to Marketplace';
        btn.style.background = '';
        closeLoanModal();
        renderLoanCards();
        showToast('✅ Loan request submitted! Go to "My Loans" page to view incoming private bids.');
    }, 800);
}

// ---- Toast Notification ----
function showToast(message) {
    var toast = document.getElementById('mp-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'mp-toast';
        toast.style.cssText = 'position:fixed;bottom:28px;left:50%;transform:translateX(-50%);background:#1e293b;color:#fff;padding:14px 24px;border-radius:12px;font-size:14px;font-weight:600;z-index:9999;box-shadow:0 8px 30px rgba(0,0,0,0.25);max-width:500px;text-align:center;transition:opacity 0.3s;';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.opacity = '1';
    clearTimeout(toast._timer);
    toast._timer = setTimeout(function() { toast.style.opacity = '0'; }, 4000);
}

// ---- Live Summary update ----
function updateLoanSummary() {
    var amount   = document.getElementById('m-loan-amount').value.trim();
    var purpose  = document.getElementById('m-loan-purpose').value;
    var duration = document.getElementById('m-loan-duration').value;

    var sumAmt = document.getElementById('m-sum-amount');
    var sumPur = document.getElementById('m-sum-purpose');
    var sumDur = document.getElementById('m-sum-duration');

    if (!sumAmt) return;

    sumAmt.textContent = (amount && !isNaN(amount) && parseInt(amount) > 0)
        ? parseInt(amount).toLocaleString() + ' BDT' : '0 BDT';
    sumPur.textContent = purpose;
    sumDur.textContent = duration;
}
