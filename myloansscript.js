/**
 * UIU Friends Network - My Loans Client Script
 * 
 * Handles all dynamic updates, calculations, tab switching, and actions
 * on the "My Loans" page using localStorage as a shared data layer.
 */

var selectedMlOffer = null; // Stores { requestId, bidId } for the confirmation modal

// ---- Helper to display trust score as stars ----
function getTrustStars(trust) {
    var rating = Math.round(trust / 20);
    var stars = '';
    for (var i = 0; i < 5; i++) {
        stars += i < rating ? '★' : '☆';
    }
    return stars;
}

// ---- Setup Shared State and Initial Data in localStorage if not set ----
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

// ---- Alert Toast helper ----
function showToast(message, iconName) {
    var alertToast = document.getElementById("alertToast");
    var toastMessage = document.getElementById("toastMessage");
    if (!alertToast || !toastMessage) return;

    toastMessage.textContent = message;
    var toastIcon = alertToast.querySelector(".toast-icon");
    if (toastIcon) {
        toastIcon.textContent = iconName || "info";
    }
    
    alertToast.classList.add("show");
    
    // Auto-remove after 3.5 seconds
    setTimeout(function() {
        alertToast.classList.remove("show");
    }, 3500);
}

// ---- Update verification badge in the header ----
function updateMyLoansVerificationBadge() {
    var badge = document.getElementById('myloans-verification-badge');
    if (!badge) return;
    if (localStorage.getItem('uiu_verified') === 'true') {
        badge.textContent = '✔ Verified CSE Student';
        badge.className = 'ml-badge verified';
        badge.style.background = 'rgba(16,185,129,0.1)';
        badge.style.color = '#065f46';
        badge.style.border = '1px solid rgba(16,185,129,0.3)';
    } else {
        badge.textContent = '⚠ Unverified';
        badge.className = 'ml-badge unverified';
        badge.style.background = 'rgba(239,68,68,0.08)';
        badge.style.color = '#7f1d1d';
        badge.style.border = '1px solid rgba(239,68,68,0.2)';
    }
}

// ==========================================================================
// Borrowed Views Rendering
// ==========================================================================

// 1. Borrowed Summary Stats
function renderBorrowedSummary() {
    var requests = JSON.parse(localStorage.getItem('loanRequests') || '[]');
    var userRequests = requests.filter(function(r) { return r.isUserRequest; });

    // Outstanding Debt = Sum of (amount - paidAmount) for Active user requests
    var activeUserRequests = userRequests.filter(function(r) { return r.status === 'Active'; });
    var totalDebt = 0;
    activeUserRequests.forEach(function(r) {
        totalDebt += (r.amount - (r.paidAmount || 0));
    });
    
    var debtEl = document.getElementById('borrowed-total-debt');
    if (debtEl) {
        debtEl.textContent = totalDebt.toLocaleString() + ' BDT';
    }

    // Next Installment Due = find the first phase with status "Due"
    var nextDueAmount = 0;
    var nextDueDateText = '';
    var foundDue = false;
    
    for (var i = 0; i < activeUserRequests.length; i++) {
        var r = activeUserRequests[i];
        if (r.payments) {
            var duePhase = r.payments.find(function(p) { return p.status === 'Due'; });
            if (duePhase) {
                nextDueAmount = duePhase.amount;
                nextDueDateText = duePhase.date;
                foundDue = true;
                break;
            }
        }
    }
    
    var nextDueEl = document.getElementById('borrowed-next-due');
    if (nextDueEl) {
        nextDueEl.textContent = foundDue ? nextDueAmount.toLocaleString() + ' BDT' : '0 BDT';
    }
    
    var nextDueFooter = document.getElementById('borrowed-next-due-footer');
    if (nextDueFooter) {
        if (foundDue) {
            nextDueFooter.innerHTML = '<span class="material-symbols-outlined">schedule</span><span>DUE ON ' + nextDueDateText + '</span>';
            nextDueFooter.className = 'card-footer-info';
            nextDueFooter.style.color = '#ec5b13'; // Primary orange
            nextDueFooter.style.fontWeight = 'bold';
        } else {
            nextDueFooter.innerHTML = '<span class="material-symbols-outlined">schedule</span><span>No upcoming installment</span>';
            nextDueFooter.className = 'card-footer-info label-gray';
            nextDueFooter.style.color = '';
            nextDueFooter.style.fontWeight = '';
        }
    }

    // Loans successfully paid = count of Completed user requests
    var completedUserRequests = userRequests.filter(function(r) { return r.status === 'Completed'; });
    var paidCountEl = document.getElementById('borrowed-paid-count');
    if (paidCountEl) {
        paidCountEl.textContent = completedUserRequests.length;
    }
    
    var paidFooter = document.getElementById('borrowed-paid-footer');
    if (paidFooter) {
        if (completedUserRequests.length > 0) {
            paidFooter.textContent = 'Paid successfully';
        } else {
            paidFooter.textContent = 'No completed loans';
        }
    }
}

// 2. Render Active borrowed loans
function renderActiveLoans() {
    var container = document.getElementById('myloans-active-container');
    if (!container) return;

    var requests = JSON.parse(localStorage.getItem('loanRequests') || '[]');
    var bids = JSON.parse(localStorage.getItem('lenderBids') || '[]');
    var activeRequests = requests.filter(function(r) { return r.isUserRequest && r.status === 'Active'; });

    if (activeRequests.length === 0) {
        container.innerHTML = '';
        return;
    }

    var html = '';
    activeRequests.forEach(function(req) {
        // Find accepted bid
        var acceptedBid = bids.find(function(b) { return b.requestId === req.id && b.status === 'Accepted'; });
        var lenderName = acceptedBid ? acceptedBid.lenderName : 'Arif Mahmud';
        var lenderTrust = acceptedBid ? acceptedBid.lenderTrust : 95;
        var interestRate = acceptedBid ? acceptedBid.rate : 4.0;

        var phasesHtml = '';
        if (req.payments) {
            req.payments.forEach(function (payment) {
                var phaseClass = '';
                var icon = '';
                var statusText = '';
                if (payment.status === 'Paid') {
                    phaseClass = 'phase-paid';
                    icon = 'check';
                    statusText = 'PAID';
                } else if (payment.status === 'Due') {
                    phaseClass = 'phase-due-soon';
                    icon = 'priority_high';
                    statusText = 'DUE ON ' + payment.date;
                } else {
                    phaseClass = 'phase-future';
                    icon = 'lock';
                    statusText = 'LOCKED';
                }
                
                phasesHtml += 
                '<div class="phase-box ' + phaseClass + '">' +
                  '<span class="phase-num">Phase ' + payment.phase + '</span>' +
                  '<span class="phase-amount">' + payment.amount.toLocaleString() + ' BDT</span>' +
                  '<div class="phase-status">' +
                    '<span class="material-symbols-outlined">' + icon + '</span>' +
                    '<span>' + statusText + '</span>' +
                  '</div>' +
                '</div>';
            });
        }

        var progressPercent = req.amount > 0 ? (req.paidAmount / req.amount * 100) : 0;

        html += 
        '<div class="investment-card" style="margin-bottom: 24px;">' +
          '<div class="investment-card-header">' +
            '<div class="borrower-profile-group">' +
              '<div class="avatar-box bg-emerald" style="background-color: var(--primary-light); color: var(--primary);">' +
                '<span class="material-symbols-outlined">school</span>' +
              '</div>' +
              '<div>' +
                '<div style="display:flex; align-items:center; gap:8px;">' +
                  '<h4 class="investment-title">' + req.title + '</h4>' +
                  '<span class="trust-badge-status" style="background-color: var(--primary-light); color: var(--primary); border-color: var(--border-primary); padding:2px 8px; font-size:10px;">Active</span>' +
                '</div>' +
                '<p class="investment-subtitle" style="margin-top: 4px;">' +
                  'Lender: <span class="highlight-text">' + lenderName + '</span>' +
                  '<span style="color:#eab308; font-size:12px; margin-left:4px;">' + getTrustStars(lenderTrust) + '</span>' +
                  ' • Interest: <span class="highlight-text">' + interestRate + '%</span>' +
                '</p>' +
              '</div>' +
            '</div>' +
            '<div style="text-align:right;">' +
              '<p style="font-size:11px; font-weight:700; text-transform:uppercase; color:var(--text-muted); margin:0;">Remaining</p>' +
              '<p style="font-size:20px; font-weight:900; color:var(--text-main); margin:2px 0 0;">' + (req.amount - req.paidAmount).toLocaleString() + ' BDT</p>' +
              '<button class="pay-btn" style="margin-top:8px; padding:6px 14px; font-size:12px; border-radius:8px; display:inline-flex; align-items:center; gap:4px; border:none; background:var(--primary); color:#fff; font-weight:700; cursor:pointer;" onclick="payInstallment(' + req.id + ')">' +
                'Pay Installment Now' +
                '<span class="material-symbols-outlined" style="font-size:14px;">arrow_forward</span>' +
              '</button>' +
            '</div>' +
          '</div>' +
          '<div class="investment-card-body">' +
            '<div class="progress-section">' +
              '<div class="progress-meta">' +
                '<span class="progress-label" style="color:var(--emerald); font-weight:600;">Paid: ' + req.paidAmount.toLocaleString() + ' BDT</span>' +
                '<span class="progress-stats">Total: ' + req.amount.toLocaleString() + ' BDT</span>' +
              '</div>' +
              '<div class="progress-bar-container">' +
                '<div class="progress-bar-fill" style="width: ' + progressPercent + '%"></div>' +
              '</div>' +
            '</div>' +
            '<h5 class="timeline-heading" style="font-size:13px; font-weight:800; color:var(--text-main); margin-bottom:-8px; margin-top:8px;">Installment Timeline</h5>' +
            '<div class="phases-grid">' +
              phasesHtml +
            '</div>' +
          '</div>' +
        '</div>';
    });

    container.innerHTML = html;
}

// 3. Render Pending loan requests + Bids comparison
function renderPendingRequests() {
    var container = document.getElementById('myloans-pending-container');
    if (!container) return;

    var requests = JSON.parse(localStorage.getItem('loanRequests') || '[]');
    var bids = JSON.parse(localStorage.getItem('lenderBids') || '[]');
    var pendingReqs = requests.filter(function(r) { return r.isUserRequest && r.status === 'Pending'; });

    var html = 
    '<div class="list-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">' +
      '<h4 class="list-title" style="font-size:16px; font-weight:800; color:var(--text-main); margin:0;">' +
        'Pending Requests' +
        '<span class="count-badge" style="background-color: var(--primary-light); color: var(--primary); padding:2px 8px; border-radius:12px; font-size:12px; margin-left:6px;">' + pendingReqs.length + '</span>' +
      '</h4>' +
    '</div>';

    if (pendingReqs.length === 0) {
        html += '<div class="empty-view-state" style="padding: 24px; border: 1px dashed var(--border-light); background:#fff;"><p style="color:var(--text-light); font-size:13px; margin:0;">No pending loan requests.</p></div>';
        container.innerHTML = html;
        return;
    }

    pendingReqs.forEach(function(req) {
        var reqBids = bids.filter(function(b) { return b.requestId === req.id && b.status === 'Pending'; });
        
        // Sort bids privately: (100 - rate) * 0.5 + trust * 0.3
        reqBids.sort(function(a, b) {
            var scoreA = (100 - a.rate) * 0.5 + a.lenderTrust * 0.3;
            var scoreB = (100 - b.rate) * 0.5 + b.lenderTrust * 0.3;
            return scoreB - scoreA; // highest score first
        });

        var bidsHtml = '';
        if (reqBids.length === 0) {
            bidsHtml = '<p style="font-size:12px; color:var(--text-muted); text-align:center; padding:16px 0; background:#f8fafc; border-radius:10px; margin:0;">No offers received yet. Once lenders place private offers, they will appear here for comparison.</p>';
        } else {
            reqBids.forEach(function(bid, index) {
                var offeredDuration = bid.duration || req.duration;
                var months = parseInt(offeredDuration) || 1;
                var estCost = req.amount * (bid.rate / 100) * (months / 12);
                var totalRepay = req.amount + estCost;
                
                var isRecommended = (index === 0 && reqBids.length > 1);
                var cardClass = 'ml-offer-card' + (isRecommended ? ' ml-recommended' : '');
                var recBadge = isRecommended ? '<span class="ml-rec-badge">RECOMMENDED</span>' : '';

                bidsHtml += 
                '<div class="' + cardClass + '" style="margin-bottom:12px;">' +
                  '<div class="ml-offer-top">' +
                    '<img class="ml-avatar" src="' + bid.lenderAvatar + '" alt="' + bid.lenderName + '">' +
                    '<div class="ml-offer-info">' +
                      '<h5 class="ml-lender-name">' +
                        bid.lenderName +
                        recBadge +
                      '</h5>' +
                      '<p class="ml-trust">Trust rating: <span style="color:#eab308; font-weight:bold;">' + getTrustStars(bid.lenderTrust) + '</span></p>' +
                    '</div>' +
                  '</div>' +
                  '<div class="ml-offer-numbers">' +
                    '<div class="ml-num-item">' +
                      '<p class="ml-num-label">Interest Rate</p>' +
                      '<p class="ml-num-val" style="color:var(--primary);">' + bid.rate + '%</p>' +
                    '</div>' +
                    '<div class="ml-num-item">' +
                      '<p class="ml-num-label">Est. Cost</p>' +
                      '<p class="ml-num-val">' + Math.round(estCost).toLocaleString() + ' BDT</p>' +
                    '</div>' +
                    '<div class="ml-num-item">' +
                      '<p class="ml-num-label">Total Repay</p>' +
                      '<p class="ml-num-val">' + Math.round(totalRepay).toLocaleString() + ' BDT</p>' +
                    '</div>' +
                    '<div class="ml-num-item">' +
                      '<p class="ml-num-label">Offered Term</p>' +
                      '<p class="ml-num-val" style="color:#1e3a8a;">' + offeredDuration + '</p>' +
                    '</div>' +
                  '</div>' +
                  '<p class="ml-privacy-note">🔒 Interest rate calculations are private to you</p>' +
                  '<button class="ml-accept-btn ' + (isRecommended ? 'ml-accept-primary' : '') + '" onclick="openMlConfirmModal(' + req.id + ', ' + bid.id + ', \'' + bid.lenderName + '\', ' + Math.round(totalRepay) + ', \'' + offeredDuration + '\')">Accept Offer</button>' +
                '</div>';
            });
        }

        html += 
        '<div class="collapsed-card" style="padding:16px; background:#fff; border:1px solid var(--border-primary); border-radius:14px; margin-bottom:20px; display:flex; flex-direction:column; gap:12px; box-shadow:var(--shadow-sm);">' +
          '<div style="display:flex; justify-content:space-between; align-items:flex-start;">' +
            '<div>' +
              '<h5 style="font-size:15px; font-weight:800; color:#1e293b; margin:0;">' + req.title + '</h5>' +
              '<p style="font-size:12px; color:#64748b; margin:4px 0 0;">Requested: <strong>' + req.amount.toLocaleString() + ' BDT</strong> • ' + req.duration + ' term</p>' +
              '<span style="display:inline-block; background-color:#fef08a; color:#a16207; font-size:10px; font-weight:800; text-transform:uppercase; padding:2px 8px; border-radius:4px; margin-top:6px;">Awaiting Offers</span>' +
            '</div>' +
            '<button class="cancel-btn" onclick="cancelPendingRequest(' + req.id + ')" title="Cancel Request">' +
              '<span class="material-symbols-outlined">cancel</span>' +
            '</button>' +
          '</div>' +
          '<div class="myloans-rec-panel" style="margin-top:8px; border-top:1px solid #f1f5f9; padding-top:12px;">' +
            '<p style="font-size:12px; font-weight:700; color:#475569; margin:0 0 10px 0;">INCOMING OFFERS (' + reqBids.length + ')</p>' +
            bidsHtml +
          '</div>' +
        '</div>';
    });

    container.innerHTML = html;
}

// 4. Render Completed borrowed loans
function renderCompletedBorrowed() {
    var container = document.getElementById('myloans-completed-container');
    if (!container) return;

    var requests = JSON.parse(localStorage.getItem('loanRequests') || '[]');
    var completedReqs = requests.filter(function(r) { return r.isUserRequest && r.status === 'Completed'; });

    var html = 
    '<div class="list-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">' +
      '<h4 class="list-title" style="font-size:16px; font-weight:800; color:var(--text-main); margin:0;">' +
        'Completed Loans' +
        '<span class="count-badge" style="background-color: #e2e8f0; color: #475569; padding:2px 8px; border-radius:12px; font-size:12px; margin-left:6px;">' + completedReqs.length + '</span>' +
      '</h4>' +
    '</div>';

    if (completedReqs.length === 0) {
        html += '<div class="completed-loans-list" style="border: 1px dashed var(--border-light); background:#fff;"><div style="padding:16px; text-align:center; color:#94a3b8; font-size:13px;">No completed loans history.</div></div>';
        container.innerHTML = html;
        return;
    }

    var listHtml = '';
    completedReqs.forEach(function(req) {
        listHtml += 
        '<div class="completed-loan-item">' +
          '<div class="completed-loan-left">' +
            '<span class="material-symbols-outlined" style="color:var(--emerald);">verified</span>' +
            '<div>' +
              '<p class="completed-loan-title">' + req.title + '</p>' +
              '<p class="completed-loan-subtitle">Paid in full • ' + req.amount.toLocaleString() + ' BDT</p>' +
            '</div>' +
          '</div>' +
          '<span class="completed-loan-badge">Cleared</span>' +
        '</div>';
    });

    html += '<div class="completed-loans-list">' + listHtml + '</div>';
    container.innerHTML = html;
}

// ==========================================================================
// Lent Views Rendering
// ==========================================================================

// 1. Lent Summary Stats
function renderLentSummary() {
    var requests = JSON.parse(localStorage.getItem('loanRequests') || '[]');
    var bids = JSON.parse(localStorage.getItem('lenderBids') || '[]');

    var myLentBids = bids.filter(function(b) { return b.lenderName === 'You' && b.status === 'Accepted'; });

    var totalActiveLent = 0;
    var totalExpectedRepay = 0;
    var totalInterestEarned = 0;

    myLentBids.forEach(function(bid) {
        var req = requests.find(function(r) { return r.id === bid.requestId; });
        if (!req) return;

        var months = parseInt(req.duration) || 1;
        var interest = req.amount * (bid.rate / 100) * (months / 12);

        if (req.status === 'Active') {
            totalActiveLent += req.amount;
            var remainingPrincipal = req.amount - (req.paidAmount || 0);
            var proportionalInterest = interest * (remainingPrincipal / req.amount);
            totalExpectedRepay += remainingPrincipal + proportionalInterest;
        } else if (req.status === 'Overdue') {
            totalExpectedRepay += (req.amount - (req.paidAmount || 0)) + interest;
        } else if (req.status === 'Completed') {
            totalInterestEarned += interest;
        }
    });

    var investedEl = document.getElementById('lent-total-invested');
    if (investedEl) investedEl.textContent = totalActiveLent.toLocaleString() + ' BDT';

    var repayEl = document.getElementById('lent-expected-repay');
    if (repayEl) repayEl.textContent = Math.round(totalExpectedRepay).toLocaleString() + ' BDT';

    var interestEl = document.getElementById('lent-total-interest');
    if (interestEl) interestEl.textContent = Math.round(totalInterestEarned).toLocaleString() + ' BDT';
}

// 2. Render recovery phases timeline inside Active Lent Cards
function renderRecoveryPhases(req) {
    var phasesHtml = '';
    if (req.payments) {
        req.payments.forEach(function(payment) {
            var phaseClass = '';
            var icon = '';
            var statusText = '';
            var reminderButtonHtml = '';
            
            if (payment.status === 'Paid') {
                phaseClass = 'phase-paid';
                icon = 'check';
                statusText = 'RECEIVED';
            } else if (payment.status === 'Due') {
                phaseClass = 'phase-due-soon';
                icon = 'priority_high';
                statusText = 'DUE ' + payment.date;
                
                var btnId = 'reminder-btn-' + req.id + '-' + payment.phase;
                reminderButtonHtml = '<button id="' + btnId + '" class="reminder-btn" onclick="sendReminder(\'' + btnId + '\', \'' + req.borrowerName + '\')">' +
                    '<span class="material-symbols-outlined">notifications</span>' +
                    '<span>Send Gentle Reminder</span>' +
                '</button>';
            } else {
                phaseClass = 'phase-future';
                icon = 'lock';
                statusText = 'DUE ON ' + payment.date;
            }

            phasesHtml += 
            '<div class="phase-box ' + phaseClass + '">' +
              '<span class="phase-num">Phase ' + payment.phase + '</span>' +
              '<span class="phase-amount">' + payment.amount.toLocaleString() + ' BDT</span>' +
              '<div class="phase-status">' +
                '<span class="material-symbols-outlined">' + icon + '</span>' +
                '<span>' + statusText + '</span>' +
              '</div>' +
              reminderButtonHtml +
            '</div>';
        });
    } else {
        // Fallback placeholder if no payments array exists
        phasesHtml = 
        '<div class="phase-box phase-due-soon">' +
          '<span class="phase-num">Repayment due</span>' +
          '<span class="phase-amount">' + req.amount.toLocaleString() + ' BDT</span>' +
          '<div class="phase-status">' +
            '<span class="material-symbols-outlined">priority_high</span>' +
            '<span>Awaiting Repayment</span>' +
          '</div>' +
        '</div>';
    }
    return phasesHtml;
}

// 3. Render Active investments (lent)
function renderActiveInvestments() {
    var container = document.getElementById('myloans-lent-active-container');
    if (!container) return;

    var requests = JSON.parse(localStorage.getItem('loanRequests') || '[]');
    var bids = JSON.parse(localStorage.getItem('lenderBids') || '[]');

    var myLentBids = bids.filter(function(b) { return b.lenderName === 'You' && b.status === 'Accepted'; });
    var html = '';

    myLentBids.forEach(function(bid) {
        var req = requests.find(function(r) { return r.id === bid.requestId && r.status === 'Active'; });
        if (!req) return;

        var progressPercent = req.amount > 0 ? ((req.paidAmount || 0) / req.amount * 100) : 0;

        html += 
        '<div class="investment-card" style="margin-bottom: 24px;">' +
          '<div class="investment-card-header">' +
            '<div class="borrower-profile-group">' +
              '<img class="avatar" src="' + req.borrowerAvatar + '" style="width:48px; height:48px; border-radius:12px; object-fit:cover;" alt="' + req.borrowerName + '">' +
              '<div>' +
                '<div style="display:flex; align-items:center; gap:8px;">' +
                  '<h4 class="investment-title">Loan to ' + req.borrowerName + '</h4>' +
                  '<span class="trust-badge-status" style="padding:2px 8px; font-size:10px;">Active</span>' +
                '</div>' +
                '<p class="investment-subtitle" style="margin-top: 4px;">' +
                  'Borrower Trust: <span style="color:#eab308; font-weight:bold;">' + getTrustStars(req.trust) + '</span>' +
                  ' • Interest: <span class="highlight-text">' + bid.rate + '%</span>' +
                '</p>' +
              '</div>' +
            '</div>' +
            '<div style="text-align:right;">' +
              '<p style="font-size:11px; font-weight:700; text-transform:uppercase; color:var(--text-muted); margin:0;">Outstanding</p>' +
              '<p style="font-size:20px; font-weight:900; color:var(--text-main); margin:2px 0 0;">' + (req.amount - (req.paidAmount || 0)).toLocaleString() + ' BDT</p>' +
            '</div>' +
          '</div>' +
          '<div class="investment-card-body">' +
            '<div class="progress-section">' +
              '<div class="progress-meta">' +
                '<span class="progress-label" style="color:var(--emerald); font-weight:600;">Recovered: ' + (req.paidAmount || 0).toLocaleString() + ' BDT</span>' +
                '<span class="progress-stats">Total Principal: ' + req.amount.toLocaleString() + ' BDT</span>' +
              '</div>' +
              '<div class="progress-bar-container">' +
                '<div class="progress-bar-fill" style="width: ' + progressPercent + '%"></div>' +
              '</div>' +
            '</div>' +
            '<h5 class="timeline-heading" style="font-size:13px; font-weight:800; color:var(--text-main); margin-bottom:-8px; margin-top:8px;">Recovery Timeline</h5>' +
            '<div class="phases-grid">' +
              renderRecoveryPhases(req) +
            '</div>' +
          '</div>' +
        '</div>';
    });

    container.innerHTML = html;
}

// 4. Render Overdue investments
function renderOverdueInvestments() {
    var container = document.getElementById('myloans-lent-overdue-container');
    if (!container) return;

    var requests = JSON.parse(localStorage.getItem('loanRequests') || '[]');
    var bids = JSON.parse(localStorage.getItem('lenderBids') || '[]');

    var myLentBids = bids.filter(function(b) { return b.lenderName === 'You' && b.status === 'Accepted'; });
    var html = '';

    myLentBids.forEach(function(bid) {
        var req = requests.find(function(r) { return r.id === bid.requestId && r.status === 'Overdue'; });
        if (!req) return;

        html += 
        '<div class="overdue-card" style="margin-bottom: 24px;">' +
          '<div class="overdue-card-header">' +
            '<div class="overdue-icon-box">' +
              '<span class="material-symbols-outlined">priority_high</span>' +
            '</div>' +
            '<div class="overdue-borrower-details">' +
            '<div class="overdue-title-row">' +
                '<h4 class="overdue-title">Overdue: Loan to ' + req.borrowerName + '</h4>' +
                '<span class="overdue-badge">Overdue</span>' +
              '</div>' +
              '<p class="overdue-subtitle" style="margin-top:6px;">' +
                'Borrower Trust Score: <span class="overdue-trust-red" style="color:#eab308; font-size:14px;">' + getTrustStars(req.trust) + '</span>' +
                '<span class="divider">|</span>' +
                'Interest Rate: <span class="bold-text">' + bid.rate + '%</span>' +
              '</p>' +
              '<p class="overdue-amount-alert" style="margin-top:6px;">' +
                'Missed Repayment: <span class="bold-text" style="font-size:16px;">' + req.amount.toLocaleString() + ' BDT</span>' +
              '</p>' +
            '</div>' +
          '</div>' +
          '<div class="overdue-card-actions">' +
            '<button class="action-btn outline-btn" onclick="messageBorrower(\'' + req.borrowerName + '\')">' +
              '<span class="material-symbols-outlined">mail</span>' +
              '<span>Message Borrower</span>' +
            '</button>' +
            '<button class="action-btn danger-btn" onclick="reportPayment(' + req.id + ', \'' + req.borrowerName + '\', ' + req.amount + ')">' +
              '<span class="material-symbols-outlined">gavel</span>' +
              '<span>Report Payment</span>' +
            '</button>' +
          '</div>' +
        '</div>';
    });

    container.innerHTML = html;
}

// 5. Render Completed returns (lent completed)
function renderCompletedReturns() {
    var container = document.getElementById('myloans-lent-completed-container');
    if (!container) return;

    var requests = JSON.parse(localStorage.getItem('loanRequests') || '[]');
    var bids = JSON.parse(localStorage.getItem('lenderBids') || '[]');

    var myLentBids = bids.filter(function(b) { return b.lenderName === 'You' && b.status === 'Accepted'; });
    var listHtml = '';

    myLentBids.forEach(function(bid) {
        var req = requests.find(function(r) { return r.id === bid.requestId && r.status === 'Completed'; });
        if (!req) return;

        listHtml += 
        '<div class="completed-item">' +
          '<div class="completed-item-left">' +
            '<span class="material-symbols-outlined" style="color:var(--emerald);">verified</span>' +
            '<div>' +
              '<p class="completed-title">Loan to ' + req.borrowerName + '</p>' +
              '<p class="completed-subtitle">Fully recovered • ' + req.amount.toLocaleString() + ' BDT</p>' +
            '</div>' +
          '</div>' +
          '<div class="completed-item-right">' +
            '<span class="completed-badge">Recovered</span>' +
          '</div>' +
        '</div>';
    });

    if (listHtml === '') {
        container.innerHTML = '<h4 class="completed-header">Completed Returns</h4><div class="completed-list" style="border:1px dashed var(--border-light); background:#fff;"><div style="padding:16px; text-align:center; color:#94a3b8; font-size:13px;">No completed returns history.</div></div>';
        return;
    }

    container.innerHTML = 
    '<h4 class="completed-header">Completed Returns</h4>' +
    '<div class="completed-list">' +
      listHtml +
    '</div>';
}

// ==========================================================================
// Expose functions globally for HTML buttons
// ==========================================================================

// Pay Installment flow
window.payInstallment = function(reqId) {
    var requests = JSON.parse(localStorage.getItem('loanRequests') || '[]');
    var req = requests.find(function(r) { return r.id === reqId; });
    if (!req || !req.payments) return;

    var duePhase = req.payments.find(function(p) { return p.status === 'Due'; });
    if (!duePhase) {
        showToast('No outstanding due installments for this loan.', 'info');
        return;
    }

    var confirmPay = confirm('Are you sure you want to transfer ' + duePhase.amount.toLocaleString() + ' BDT to lender for your "' + req.title + '" installment?');
    if (!confirmPay) return;

    showToast('Processing payment of ' + duePhase.amount.toLocaleString() + ' BDT via bKash...', 'payments');

    setTimeout(function() {
        // Reload data to avoid race conditions
        requests = JSON.parse(localStorage.getItem('loanRequests') || '[]');
        req = requests.find(function(r) { return r.id === reqId; });
        
        var duePhaseIndex = req.payments.findIndex(function(p) { return p.status === 'Due'; });
        if (duePhaseIndex === -1) return;

        var phaseObj = req.payments[duePhaseIndex];
        phaseObj.status = 'Paid';
        phaseObj.txn = 'TXN_' + Math.floor(10000000 + Math.random() * 90000000);
        phaseObj.paidDate = 'TODAY';

        req.paidAmount = (req.paidAmount || 0) + phaseObj.amount;

        // Unlock next phase if exists
        var nextPhase = req.payments[duePhaseIndex + 1];
        if (nextPhase && nextPhase.status === 'Locked') {
            nextPhase.status = 'Due';
            nextPhase.date = 'IN 30 DAYS';
        }

        // Complete the loan if all phases are Paid
        var allPaid = req.payments.every(function(p) { return p.status === 'Paid'; });
        if (allPaid) {
            req.status = 'Completed';
        }

        localStorage.setItem('loanRequests', JSON.stringify(requests));
        
        renderAll();
        showToast('Payment successful! Installment Phase ' + phaseObj.phase + ' is marked as paid.', 'check_circle');
    }, 1500);
};

// Cancel Pending Loan Request
window.cancelPendingRequest = function(reqId) {
    var requests = JSON.parse(localStorage.getItem('loanRequests') || '[]');
    var req = requests.find(function(r) { return r.id === reqId; });
    if (!req) return;

    var confirmCancel = confirm("Are you sure you want to cancel your pending '" + req.title + "' request of " + req.amount.toLocaleString() + " BDT?");
    if (!confirmCancel) return;

    requests = requests.filter(function(r) { return r.id !== reqId; });
    localStorage.setItem('loanRequests', JSON.stringify(requests));

    // Remove associated bids
    var bids = JSON.parse(localStorage.getItem('lenderBids') || '[]');
    bids = bids.filter(function(b) { return b.requestId !== reqId; });
    localStorage.setItem('lenderBids', JSON.stringify(bids));

    renderAll();
    showToast('✅ Loan request cancelled successfully.', 'cancel');
};

// Open offer acceptance confirmation modal
window.openMlConfirmModal = function(requestId, bidId, lenderName, totalRepay, offeredDuration) {
    selectedMlOffer = { requestId: requestId, bidId: bidId };
    
    var requests = JSON.parse(localStorage.getItem('loanRequests') || '[]');
    var req = requests.find(function(r) { return r.id === requestId; });
    var bids = JSON.parse(localStorage.getItem('lenderBids') || '[]');
    var bid = bids.find(function(b) { return b.id === bidId; });

    if (!req || !bid) return;

    var durationToShow = offeredDuration || bid.duration || req.duration;

    var detailsEl = document.getElementById('myloans-confirm-details');
    if (detailsEl) {
        detailsEl.innerHTML = 
        '<div class="ml-confirm-row"><span>Lender:</span><strong>' + lenderName + '</strong></div>' +
        '<div class="ml-confirm-row"><span>Trust Rating:</span><strong>' + getTrustStars(bid.lenderTrust) + '</strong></div>' +
        '<div class="ml-confirm-row"><span>Principal Loan:</span><strong>' + req.amount.toLocaleString() + ' BDT</strong></div>' +
        '<div class="ml-confirm-row"><span>Interest Rate:</span><strong>' + bid.rate + '%</strong></div>' +
        '<div class="ml-confirm-row"><span>Total Repayment:</span><strong>' + parseFloat(totalRepay).toLocaleString() + ' BDT</strong></div>' +
        '<div class="ml-confirm-row"><span>Term Duration:</span><strong>' + durationToShow + '</strong></div>';
    }

    var modal = document.getElementById('myloans-confirm-modal');
    if (modal) {
        modal.classList.add('open');
    }
};

// Close offer acceptance confirmation modal
window.closeMlConfirmModal = function() {
    var modal = document.getElementById('myloans-confirm-modal');
    if (modal) {
        modal.classList.remove('open');
    }
    selectedMlOffer = null;
};

// Accept Offer execution
window.acceptMlOffer = function() {
    if (!selectedMlOffer) return;
    
    var reqId = selectedMlOffer.requestId;
    var bidId = selectedMlOffer.bidId;

    var requests = JSON.parse(localStorage.getItem('loanRequests') || '[]');
    var bids = JSON.parse(localStorage.getItem('lenderBids') || '[]');

    var reqIndex = requests.findIndex(function(r) { return r.id === reqId; });
    var bidIndex = bids.findIndex(function(b) { return b.id === bidId; });

    if (reqIndex === -1 || bidIndex === -1) {
        closeMlConfirmModal();
        return;
    }

    var acceptedBid = bids[bidIndex];

    // Accept bid and reject other bids for this request
    bids.forEach(function(b) {
        if (b.requestId === reqId) {
            if (b.id === bidId) {
                b.status = 'Accepted';
            } else {
                b.status = 'Rejected';
            }
        }
    });

    // Update request: status Active, create dynamic payments timeline
    var req = requests[reqIndex];
    req.status = 'Active';
    req.paidAmount = 0;
    
    var offeredDuration = acceptedBid.duration || req.duration;
    req.duration = offeredDuration; // Override request's duration with lender's offered duration
    
    var durationMonths = parseInt(offeredDuration) || 1;
    var monthlyAmount = Math.round(req.amount / durationMonths);
    var payments = [];
    var monthsList = ['OCT', 'NOV', 'DEC', 'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP'];
    var startMonthIndex = 1; // NOV

    for (var i = 1; i <= durationMonths; i++) {
        var dateStr = monthsList[(startMonthIndex + i - 1) % 12] + ' 1';
        payments.push({
            phase: i,
            amount: monthlyAmount,
            status: (i === 1) ? 'Due' : 'Locked',
            date: dateStr
        });
    }
    req.payments = payments;

    localStorage.setItem('loanRequests', JSON.stringify(requests));
    localStorage.setItem('lenderBids', JSON.stringify(bids));

    closeMlConfirmModal();
    renderAll();
    showToast('✅ Offer accepted! Your loan is now active. View details in the Active section.', 'check_circle');
};

// Gentle reminder trigger (lent tab)
window.sendReminder = function(btnId, borrowerName) {
    var btn = document.getElementById(btnId);
    if (!btn) return;
    
    if (btn.classList.contains('sent')) {
        showToast("You have already sent a reminder to " + borrowerName + " today.", "check_circle");
        return;
    }

    btn.classList.add('sent');
    btn.innerHTML = '<span class="material-symbols-outlined">check_circle</span><span>Reminder Sent!</span>';
    
    showToast("Gentle reminder sent successfully to " + borrowerName + "!", "notifications_active");
};

// Message borrower redirect
window.messageBorrower = function(borrowerName) {
    showToast("Opening Secure Chat with " + borrowerName + "...", "mail");
    setTimeout(function() {
        window.location.href = "agreement.html";
    }, 1500);
};

// Report non-payment alert
window.reportPayment = function(reqId, borrowerName, amount) {
    var confirmReport = confirm("Are you sure you want to report " + borrowerName + " for missing the payment of " + amount.toLocaleString() + " BDT? This will lower their trust score by 15% and notify the administration.");
    if (confirmReport) {
        var requests = JSON.parse(localStorage.getItem('loanRequests') || '[]');
        var req = requests.find(function(r) { return r.id === reqId; });
        if (req) {
            req.trust = Math.max(0, req.trust - 15);
            localStorage.setItem('loanRequests', JSON.stringify(requests));
        }
        showToast("Non-payment reported. UIU Friends Admin panel has been notified.", "gavel");
        renderAll();
    }
};

// ---- Main Render Orchestrator ----
function renderAll() {
    // Borrowed
    renderBorrowedSummary();
    renderActiveLoans();
    renderPendingRequests();
    renderCompletedBorrowed();

    // Lent
    renderLentSummary();
    renderActiveInvestments();
    renderOverdueInvestments();
    renderCompletedReturns();

    updateMyLoansVerificationBadge();
}

// ==========================================================================
// Page Event Listeners
// ==========================================================================
document.addEventListener("DOMContentLoaded", function () {
    // Seed localStorage data
    initLocalStorageData();

    // Render initially
    renderAll();

    // Tab Switching
    var borrowedTabBtn = document.getElementById("borrowedTabBtn");
    var lentTabBtn = document.getElementById("lentTabBtn");
    var borrowedView = document.getElementById("borrowedView");
    var lentView = document.getElementById("lentView");

    if (borrowedTabBtn && lentTabBtn) {
        // Tab: Borrowed
        borrowedTabBtn.addEventListener("click", function () {
            borrowedTabBtn.classList.add("active");
            lentTabBtn.classList.remove("active");
            borrowedView.classList.remove("hidden");
            lentView.classList.add("hidden");
        });

        // Tab: Lent
        lentTabBtn.addEventListener("click", function () {
            lentTabBtn.classList.add("active");
            borrowedTabBtn.classList.remove("active");
            lentView.classList.remove("hidden");
            borrowedView.classList.add("hidden");
        });
    }

    // Dynamic Search Filter
    var searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            var query = e.target.value.toLowerCase().trim();
            var items = document.querySelectorAll('.investment-card, .collapsed-card, .completed-loan-item, .overdue-card, .completed-item');
            
            items.forEach(function(item) {
                var text = item.textContent.toLowerCase();
                if (query === '' || text.indexOf(query) > -1) {
                    item.style.display = '';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }
});
