const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { CatchAsyncError } = require("./catchAsyncErrors");
const ErrorHandler = require("../utils/ErrorHandler");
const { redis } = require("../utils/redis");
const { updateAccessToken } = require("../controllers/userController");

dotenv.config();
const SECRET_KEY = process.env.JWT_SECRET; // Store secret key in .env
const SECRET_SSB = process.env.SECRET_KEY; // Store secret key in .env

/**
 * Authenticate user via Authorization header token (Bearer Token)
 * Used for frontend that sends token in headers.
 */
const authenticateJWT = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  console.log('[AuthJWT] Token received:', token ? 'Yes' : 'No');
  console.log('[AuthJWT] Full Authorization header:', req.headers.authorization);

  if (!token) {
    console.log('[AuthJWT] No token found in request');
    return res.status(403).json({ error: "Access denied, token missing" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_SSB);
    console.log('[AuthJWT] Token decoded successfully:', decoded);
    req.user = decoded; // Attach user info to request
    next();
  } catch (err) {
    console.log('[AuthJWT] Token verification failed:', err.message);
    return res.status(401).json({ error: "Invalid token" });
  }
};

const optionalAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, SECRET_SSB);
    req.user = decoded;
    next();
  } catch (err) {
    next();
  }
};

const requireAdmin = (req, res, next) => {
  console.log('req.user', req.user)
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin only' });
  }
  next();
};

// Custom middleware to check if user is admin (accepts both 'admin' and 'universal_admin')
const verifyUniversalAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'universal_admin')) {
    req.admin = req.user; // Set admin info for use in controllers
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
};

// Token verification middleware for tasks
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(403).json({ error: "Access denied, token missing" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_SSB);
    req.user = decoded; // Attach user info to request
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

const SHARED_SECRET = "super-secret-token-123";

const usercheck = (req, res, next) => {
  const secretHeader = req.headers["x-custom-auth"];

  if (secretHeader === SHARED_SECRET) {
    return next();
  }

  const token = req.headers.authorization?.split(" ")[1];
  // console.log('authheader', token)

  if (!token) {
    return res.status(403).json({ error: "Access denied, token missing" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_SSB);
    // console.log('decoded', decoded)
    req.user = decoded; // Attach user info to request
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

/**
 * Authenticate user via HTTP-only cookies
 * Used for frontend that stores authentication token in cookies.
 */
// const isAuthenticated = CatchAsyncError(async (req, res, next) => {
//   const access_token = req.cookies.access_token;
//   console.log('access_token', access_token)
//   console.log('req', req)
//   console.log('req.cookies', req.cookies)

//   if (!access_token) {
//     return next(new ErrorHandler("Please login to access this resource", 400));
//   }

//   const decoded = jwt.decode(access_token);

//   if (!decoded) {
//     console.log('decoded fail')
//     return next(new ErrorHandler("Access token is not valid", 400));
//   }

//   // Check if the access token is expired
//   if (decoded.exp && decoded.exp <= Date.now() / 1000) {
//     try {
//       await updateAccessToken(req, res, next);
//     } catch (error) {
//       console.log('error fail')
//       console.log(error)
//       return next(error);
//     }
//   } else {
//     const user = await redis.get(decoded.id);

//     if (!user) {
//       console.log('userfails', user)
//       return next(new ErrorHandler("Please login to access this resource", 400));
//     }

//     req.user = JSON.parse(user);
//     next();
//   }
// });

const isAuthenticated = CatchAsyncError(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new ErrorHandler("Unauthorized", 401));
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const user = await redis.get(decoded.id);

    if (!user) {
      return next(new ErrorHandler("Unauthorized", 401));
    }

    req.user = JSON.parse(user);
    next();
  } catch (error) {
    return next(new ErrorHandler("Invalid Token", 401));
  }
});

/**
 * Authorize user roles
 * Used to restrict access based on user roles.
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role || "")) {
      return next(
        new ErrorHandler(
          `Role: ${req.user?.role} is not allowed to access this resource`,
          403
        )
      );
    }
    next();
  };
};

module.exports = { authenticateJWT, isAuthenticated, requireAdmin, optionalAuth, authorizeRoles, usercheck, verifyUniversalAdmin, verifyToken };
