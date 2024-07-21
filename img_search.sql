-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 21, 2024 at 09:54 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `img_search`
--

-- --------------------------------------------------------

--
-- Table structure for table `comments`
--

CREATE TABLE `comments` (
  `id` int(11) NOT NULL,
  `imageId` int(11) DEFAULT NULL,
  `comment` text NOT NULL,
  `nickname` varchar(255) NOT NULL,
  `timestamp` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `comments`
--

INSERT INTO `comments` (`id`, `imageId`, `comment`, `nickname`, `timestamp`) VALUES
(1, 1, 'This is a beautiful image', 'John Doe', '2024-06-08 19:04:25'),
(2, 1, 'I love this image', 'Jane Doe', '2024-06-08 19:04:25'),
(3, 2, 'This is a crow', 'John Doe', '2024-06-08 19:04:25'),
(4, 2, 'I love this bird', 'Jane Doe', '2024-06-08 19:04:25'),
(5, 3, 'This is a mine', 'John Doe', '2024-06-08 19:04:25'),
(6, 3, 'I love this image', 'Jane Doe', '2024-06-08 19:04:25'),
(7, 4, 'This is a concussion', 'John Doe', '2024-06-08 19:04:25'),
(8, 4, 'I love this image', 'Jane Doe', '2024-06-08 19:04:25'),
(9, 9, 'silly image', 'markus', '2024-06-10 02:12:17'),
(10, 5, 'vsdvsdv', 'sdf', '2024-06-16 04:01:48'),
(11, 8, 'adasda', 'qwed', '2024-06-21 04:39:48'),
(12, 8, 'fall', 'asd', '2024-06-21 04:46:59'),
(13, 8, ' comment', 'test', '2024-06-21 04:49:26'),
(14, 8, 'dsfsdf', 'asdsa', '2024-06-21 04:53:14'),
(15, 8, 'dgdg', 'v', '2024-06-21 04:57:35'),
(16, 8, 'cvxxcbxcb', 'dfdffd', '2024-06-21 04:58:15'),
(17, 12, 'vcxcvxvc', 'dssd', '2024-06-21 20:37:18'),
(18, 12, 'xcvxcvxcv', 'cxvxcv', '2024-06-21 20:38:06'),
(19, 12, 'zcvvxvc', 'dsdvs', '2024-06-21 21:34:13'),
(20, 12, 'Man', 'hey', '2024-06-21 21:59:59'),
(21, 11, 'sdfsdfdsfdsfsdf', 'asdas', '2024-06-21 22:19:49');

-- --------------------------------------------------------

--
-- Table structure for table `images`
--

CREATE TABLE `images` (
  `id` int(11) NOT NULL,
  `views` int(11) DEFAULT 0,
  `url` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `tags` longtext DEFAULT NULL,
  `tag` varchar(255) NOT NULL,
  `timestamp` datetime DEFAULT NULL,
  `nickname` varchar(255) NOT NULL,
  `likes` int(11) DEFAULT 0,
  `dislikes` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `images`
--

INSERT INTO `images` (`id`, `views`, `url`, `name`, `tags`, `tag`, `timestamp`, `nickname`, `likes`, `dislikes`) VALUES
(1, 4, '/images/landscape.jpeg', 'Tree', '[\"nature\", \"landscape\"]', '', '2024-06-08 19:04:25', 'John Doe', 1, 0),
(2, 0, '/images/bird.jpg', 'crow', '[\"fly\", \"bird\", \"animal\"]', '', '2024-06-08 19:04:25', 'John Doe', 0, 0),
(3, 6, '/images/mine.jpg', 'Mine', '[\"war\", \"sea\", \"mine\", \"explosion\"]', '', '2024-06-08 19:04:25', 'Jane Doe', 1, 0),
(4, 2, '/images/CTE.gif', 'Concussion', '[\"brain\", \"head\", \"skull\"]', '', '2024-06-08 19:04:25', 'Jane Doe', 0, 0),
(5, 25, '/images/1717879879232.png', 'Sodoku', '[\"puzzle\", \"math\", \"game\", \"japan\", \"sodoku\"]', '', '2024-06-08 19:04:25', 'James', 3, 1),
(6, 0, '/images/1717884562135.png', 'Thing', '[\"sad\", \"face\", \"emoji\"]', '', '2024-06-08 19:04:25', 'it', 0, 0),
(7, 0, '/images/1717884610406.jpg', 'space', '[\"space\", \"stars\", \"galaxy\"]', '', '2024-06-08 19:04:25', 'jonhy', 0, 0),
(8, 3, '/images/1717910058983.png', 'Screenshot', '[\"Vcam\", \"camera\", \"webcam\"]', '', '2024-06-08 19:04:25', 'Dummiez', 0, 0),
(9, 0, '/images/1717975395096.jpeg', 'Stars', '[\"Space\", \"Stars\"]', '', '2024-06-08 19:04:25', 'SpaceGuru', 0, 0),
(10, 0, 'https://res.cloudinary.com/dfquan1h5/image/upload/v1717975458/fup4kes7lllkuiocff8b.jpg', 'space', '[\"stars\"]', '', '2024-06-08 19:04:25', 'harry', 0, 0),
(11, 28, 'https://res.cloudinary.com/dfquan1h5/image/upload/v1717986047/lnufrxhji5r6zznecfer.jpg', 'Camel', '[\"Camel\", \"desert\", \"animal\", \"dromedary\", \"arid\"]', '', '2024-06-08 19:04:25', 'AArab', 4, 0),
(12, 11, 'https://res.cloudinary.com/dfquan1h5/image/upload/v1717986417/ix3jpclgpgmsqsq8cy7g.jpg', 'Sytrus', '[\"FL_Studio\", \"Sytrus\", \"Sound\", \"Pack\", \"Music\", \"Systhesis\"]', '', '2024-06-08 19:04:25', 'FL_Studio Nerd', 1, 0),
(15, 0, 'https://res.cloudinary.com/dfquan1h5/image/upload/v1719094543/ayhr8oguuk8qkuxdctr1.jpg', 'Camel Fat', 'camel,hump,fat,animal,desert', '', '0000-00-00 00:00:00', 'AArab', 0, 0);

-- --------------------------------------------------------

--
-- Table structure for table `thumbnails`
--

CREATE TABLE `thumbnails` (
  `id` int(11) NOT NULL,
  `url` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `tags` longtext DEFAULT NULL,
  `timestamp` datetime DEFAULT NULL,
  `nickname` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `thumbnails`
--

INSERT INTO `thumbnails` (`id`, `url`, `name`, `tags`, `timestamp`, `nickname`) VALUES
(1, '/images/landscape.jpeg', 'Tree', '[\"nature\", \"landscape\"]', '2024-06-08 19:04:25', 'John Doe'),
(2, '/images/bird.jpg', 'crow', '[\"fly\", \"bird\", \"animal\"]', '2024-06-08 19:04:25', 'John Doe'),
(3, '/images/mine.jpg', 'Mine', '[\"war\", \"sea\", \"mine\", \"explosion\"]', '2024-06-08 19:04:25', 'Jane Doe'),
(4, '/images/CTE.gif', 'Concussion', '[\"brain\", \"head\", \"skull\"]', '2024-06-08 19:04:25', 'Jane Doe'),
(5, '/images/1717879879232.png', 'Sodoku', '[\"puzzle\", \"math\", \"game\", \"japan\", \"sodoku\"]', '2024-06-08 19:04:25', 'James'),
(6, '/images/1717884562135.png', 'Thing', '[\"sad\", \"face\", \"emoji\"]', '2024-06-08 19:04:25', 'it'),
(7, '/images/1717884610406.jpg', 'space', '[\"space\", \"stars\", \"galaxy\"]', '2024-06-08 19:04:25', 'jonhy'),
(8, '/images/1717910058983.png', 'Screenshot', '[\"Vcam\", \"camera\", \"webcam\"]', '2024-06-08 19:04:25', 'Dummiez'),
(9, '/images/1717975395096.jpeg', 'Stars', '[\"Space\", \"Stars\"]', '2024-06-08 19:04:25', 'SpaceGuru'),
(10, 'https://res.cloudinary.com/dfquan1h5/image/upload/v1717975458/fup4kes7lllkuiocff8b.jpg', 'space', '[\"stars\"]', '2024-06-08 19:04:25', 'harry'),
(11, 'https://res.cloudinary.com/dfquan1h5/image/upload/v1717986047/lnufrxhji5r6zznecfer.jpg', 'Camel', '[\"Camel\", \"desert\", \"animal\", \"dromedary\", \"arid\"]', '2024-06-08 19:04:25', 'AArab'),
(12, 'https://res.cloudinary.com/dfquan1h5/image/upload/v1717986417/ix3jpclgpgmsqsq8cy7g.jpg', 'Sytrus', '[\"FL_Studio\", \"Sytrus\", \"Sound\", \"Pack\", \"Music\", \"Systhesis\"]', '2024-06-08 19:04:25', 'FL_Studio Nerd'),
(14, 'https://res.cloudinary.com/dfquan1h5/image/upload/v1719094544/ycfdgkleg1tjwn4ykzlo.jpg', 'Camel Fat', 'camel,hump,fat,animal,desert', '0000-00-00 00:00:00', 'AArab');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `comments`
--
ALTER TABLE `comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `imageId` (`imageId`);

--
-- Indexes for table `images`
--
ALTER TABLE `images`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `thumbnails`
--
ALTER TABLE `thumbnails`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `comments`
--
ALTER TABLE `comments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `images`
--
ALTER TABLE `images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `thumbnails`
--
ALTER TABLE `thumbnails`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `comments`
--
ALTER TABLE `comments`
  ADD CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`imageId`) REFERENCES `images` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
